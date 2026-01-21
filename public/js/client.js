/**
 * Huvudmodul för poker planning-klienten
 * Koordinerar WebSocket-kommunikation och UI-uppdateringar
 */

import { SocketManager } from './socket.js';
import { UIManager } from './ui.js';
import { i18n } from './i18n.js';
import ThemeManager from './themeManager.js';

// Initiera managers
const socketManager = new SocketManager();
const uiManager = new UIManager();

/**
 * Initialiserar applikationen
 */
function init() {
    // Anslut till WebSocket-server
    socketManager.connect();

    // Sätt upp event-lyssnare för UI
    setupUIEventListeners();

    // Sätt upp event-lyssnare för WebSocket
    setupSocketEventListeners();

    // Initiera översättningar
    i18n.updatePageTranslations();

    // Initiera tema
    ThemeManager.init();
}

/**
 * Sätter upp UI event-lyssnare
 */
function setupUIEventListeners() {
    // Välkomstskärm - Skapa session
    document.getElementById('create-session-btn').addEventListener('click', async () => {
        const username = document.getElementById('username').value.trim();
        const selectedTheme = document.getElementById('theme-selector').value;

        if (!username) {
            uiManager.showError(i18n.t('error.name.required'));
            return;
        }

        // Apply selected theme
        ThemeManager.applyTheme(selectedTheme);

        try {
            const response = await socketManager.createSession(username, selectedTheme);
            uiManager.showScreen('planning');
            uiManager.displaySessionInfo(response.sessionId, username, response.isCreator);
        } catch (error) {
            uiManager.showError(i18n.t('error.session.create') + ' ' + error);
        }
    });

    // Välkomstskärm - Gå med i session
    document.getElementById('join-session-btn').addEventListener('click', async () => {
        const username = document.getElementById('username').value.trim();
        const sessionId = document.getElementById('session-id-input').value.trim();

        if (!username) {
            uiManager.showError(i18n.t('error.name.required'));
            return;
        }

        if (!sessionId) {
            uiManager.showError(i18n.t('error.sessionid.required'));
            return;
        }

        try {
            const response = await socketManager.joinSession(sessionId, username);
            uiManager.showScreen('planning');
            uiManager.displaySessionInfo(response.sessionId, username, response.isCreator);
        } catch (error) {
            uiManager.showError(i18n.t('error.session.join') + ' ' + error);
        }
    });

    // Enter-tangent för att gå med
    document.getElementById('session-id-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('join-session-btn').click();
        }
    });

    document.getElementById('username').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('create-session-btn').click();
        }
    });

    // Starta röstning
    document.getElementById('start-voting-btn').addEventListener('click', () => {
        const timerMinutes = parseFloat(document.getElementById('timer-duration').value) || 0;
        socketManager.startVoting(timerMinutes);
    });

    // Kortval
    document.getElementById('cards-container').addEventListener('click', (e) => {
        if (e.target.classList.contains('card')) {
            uiManager.handleCardSelection(e.target);
            socketManager.submitVote(e.target.dataset.value);
        }
    });



    // Återställ omröstning (Ny röstning)
    const newRoundBtn = document.getElementById('new-round-btn');
    if (newRoundBtn) {
        newRoundBtn.addEventListener('click', () => {
            socketManager.resetRound();
        });
    }

    // Avslöja röster nu (för sessionsskapare)
    document.getElementById('reveal-now-btn').addEventListener('click', () => {
        socketManager.revealVotes();
    });

    // Språkväxlare
    document.getElementById('language-toggle').addEventListener('click', () => {
        const currentLang = i18n.getLanguage();
        const newLang = currentLang === 'sv' ? 'en' : 'sv';
        i18n.setLanguage(newLang);
    });

    // End session button
    document.getElementById('end-session-btn').addEventListener('click', () => {
        const confirmMessage = i18n.getLanguage() === 'sv'
            ? 'Är du säker på att du vill avsluta sessionen? Alla deltagare kommer att kopplas från.'
            : 'Are you sure you want to end the session? All participants will be disconnected.';

        if (confirm(confirmMessage)) {
            socketManager.socket.emit('end-session');
        }
    });

    // Copy session ID button
    document.getElementById('copy-session-id-btn').addEventListener('click', async () => {
        const sessionId = document.getElementById('session-id-display').textContent;

        try {
            await navigator.clipboard.writeText(sessionId);

            // Visual feedback
            const btn = document.getElementById('copy-session-id-btn');
            const originalText = btn.textContent;
            btn.textContent = '✓';
            btn.style.color = '#4CAF50';

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.color = '';
            }, 2000);

            // Optional: Show toast message
            console.log(i18n.t('session.copy.success'));
        } catch (err) {
            console.error('Failed to copy:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = sessionId;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    });

    // Chat - Skicka meddelande
    const sendChatMessage = () => {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        console.log('Sending chat message:', message);
        if (message) {
            socketManager.sendMessage(message);
            input.value = '';
        }
    };

    document.getElementById('chat-send-btn').addEventListener('click', sendChatMessage);
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
}

/**
 * Sätter upp WebSocket event-lyssnare
 */
function setupSocketEventListeners() {
    // Deltagare uppdaterade
    socketManager.on('participants-updated', (participants) => {
        uiManager.updateParticipants(participants, socketManager.isCreator, socketManager.userId);

        // Add click listeners for kick buttons
        if (socketManager.isCreator) {
            document.querySelectorAll('.kick-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const userId = btn.getAttribute('data-kick-user-id');
                    if (confirm(i18n.getLanguage() === 'sv' ? 'Vill du kicka denna användare?' : 'Do you want to kick this user?')) {
                        socketManager.kickUser(userId);
                    }
                });
            });
        }
    });

    // Röstning startad
    socketManager.on('voting-started', (data) => {
        uiManager.showVotingArea(data.timerDuration, data.timerStartedAt, socketManager.isCreator);
    });

    // Användare har röstat
    socketManager.on('user-voted', (data) => {
        uiManager.markUserVoted(data.userId);

        // Uppdatera reveal-kontroller om användaren är sessionsskapare
        if (socketManager.isCreator && data.totalVotes !== undefined) {
            uiManager.updateRevealControls(data.allVoted, data.totalVotes, data.totalParticipants);
        }
    });

    // Röster avslöjade
    socketManager.on('votes-revealed', (results) => {
        uiManager.showResults(results);
    });

    // Förklaring inskickad
    socketManager.on('explanation-submitted', (data) => {
        // Hitta användarnamn från deltagarlistan
        const participantItem = document.querySelector(`[data-user-id="${data.userId}"]`);
        const username = participantItem ?
            participantItem.textContent.replace('👤', '').trim().replace('✓', '').trim() :
            'Unknown';

        uiManager.addExplanation(data.userId, username, data.explanation);
    });

    // Omröstning återställd
    // Runda återställd
    socketManager.on('round-reset', (data) => {
        uiManager.resetView();

        // Visa timer-kontroller igen för skaparen så hen kan starta ny röstning
        if (socketManager.isCreator) {
            document.getElementById('timer-controls').classList.remove('hidden');
        }

        // Visa väntmeddelande för deltagare tills skaparen startar röstningen
        if (!socketManager.isCreator) {
            document.getElementById('waiting-message').classList.remove('hidden');
            document.getElementById('voting-area').classList.add('hidden');
        }
    });

    // Kickad från sessionen
    socketManager.on('kicked', () => {
        alert(i18n.t('admin.kicked.message'));
        window.location.reload();
    });

    // Chattmeddelande mottaget
    socketManager.on('chat-message', (chatMessage) => {
        console.log('Chat message received:', chatMessage);
        uiManager.addChatMessage(chatMessage);
    });

    // Chatthistorik mottagen
    socketManager.on('chat-history', (messages) => {
        console.log('Chat history received:', messages);
        messages.forEach(msg => uiManager.addChatMessage(msg));
    });

    // Session ended
    socketManager.on('session-ended', () => {
        alert(i18n.t('session.ended.title') + '\n\n' + i18n.t('session.ended.message'));
        window.location.reload();
    });

    // Theme changed
    socketManager.on('theme-changed', (theme) => {
        console.log('Theme changed to:', theme);
        ThemeManager.applyTheme(theme);
    });
}

// Starta applikationen när DOM är laddad
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
