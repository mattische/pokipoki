/**
 * main poker planning client module
 * coordinates websocket and ui updates
 */

import { SocketManager } from './socket.js';
import { UIManager } from './ui.js';
import { i18n } from './i18n.js';
import ThemeManager from './themeManager.js';
import { DECKS, DEFAULT_DECK } from './decks.js';

// initialize managers
const socketManager = new SocketManager();
const uiManager = new UIManager();

/**
 * initializes application
 */
function init() {
    // connect to websocket server
    socketManager.connect();

    // setup ui event listeners
    setupUIEventListeners();

    // setup websocket event listeners
    setupSocketEventListeners();

    // initialize translations
    i18n.updatePageTranslations();

    // initialize theme
    ThemeManager.init();
}

/**
 * sets up ui event listeners
 */
function setupUIEventListeners() {
    // deck selector on welcome screen
    const deckSelector = document.getElementById('deck-selector');
    const deckDescEl = document.getElementById('deck-description');
    const deckPreviewEl = document.getElementById('deck-preview');

    const updateDeckDescription = () => {
        const deckId = deckSelector.value;
        const deck = DECKS[deckId];
        if (deck) {
            deckDescEl.textContent = i18n.t(deck.descKey);
            deckPreviewEl.innerHTML = deck.cards
                .map(card => `<span class="deck-preview-card">${card.value}</span>`)
                .join('');
        }
    };

    deckSelector.addEventListener('change', updateDeckDescription);
    updateDeckDescription();

    // welcome screen - create session
    document.getElementById('create-session-btn').addEventListener('click', async () => {
        const username = document.getElementById('username').value.trim();
        const selectedTheme = document.getElementById('theme-selector').value;
        const selectedDeck = deckSelector.value || DEFAULT_DECK;

        if (!username) {
            uiManager.showError(i18n.t('error.name.required'));
            return;
        }

        // Apply selected theme
        ThemeManager.applyTheme(selectedTheme);

        try {
            const response = await socketManager.createSession(username, selectedTheme, selectedDeck);
            uiManager.showScreen('planning');
            uiManager.displaySessionInfo(response.sessionId, username, response.isCreator);
        } catch (error) {
            uiManager.showError(i18n.t('error.session.create') + ' ' + error);
        }
    });

    // welcome screen - join session
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

    // enter key to join
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

    // start voting
    document.getElementById('start-voting-btn').addEventListener('click', () => {
        const timerMinutes = parseFloat(document.getElementById('timer-duration').value) || 0;
        socketManager.startVoting(timerMinutes);
    });

    // card selection
    document.getElementById('cards-container').addEventListener('click', (e) => {
        if (e.target.classList.contains('card')) {
            uiManager.handleCardSelection(e.target);
            socketManager.submitVote(e.target.dataset.value);
        }
    });

    // card description on hover
    const cardsContainer = document.getElementById('cards-container');
    const descriptionPanel = document.getElementById('card-description-panel');

    cardsContainer.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('card')) {
            const key = e.target.dataset.descKey;
            if (key) {
                descriptionPanel.textContent = i18n.t(key);
                descriptionPanel.classList.add('visible');
            }
        }
    });

    cardsContainer.addEventListener('mouseout', (e) => {
        if (e.target.classList.contains('card')) {
            descriptionPanel.classList.remove('visible');
        }
    });



    // reset voting (new round)
    const newRoundBtn = document.getElementById('new-round-btn');
    if (newRoundBtn) {
        newRoundBtn.addEventListener('click', () => {
            socketManager.resetRound();
        });
    }

    // reveal votes now (for creator)
    document.getElementById('reveal-now-btn').addEventListener('click', () => {
        socketManager.revealVotes();
    });

    // language toggle
    document.getElementById('language-toggle').addEventListener('click', () => {
        const currentLang = i18n.getLanguage();
        const newLang = currentLang === 'sv' ? 'en' : 'sv';
        i18n.setLanguage(newLang);
    });

    // End session button
    document.getElementById('end-session-btn').addEventListener('click', () => {
        const participantCount = parseInt(document.getElementById('participant-count').textContent, 10) || 0;
        const othersCount = participantCount - 1; // exclude host

        let confirmMessage;
        if (othersCount > 0) {
            confirmMessage = i18n.t('session.end.confirm.participants').replace('{n}', othersCount);
        } else {
            confirmMessage = i18n.t('session.end.confirm');
        }

        if (confirm(confirmMessage)) {
            socketManager.socket.emit('end-session');
        }
    });

    // Copy session ID button
    document.getElementById('copy-session-id-btn').addEventListener('click', async () => {
        const sessionId = document.getElementById('session-id-display').textContent;
        const btn = document.getElementById('copy-session-id-btn');
        const label = btn.querySelector('.session-id-copy-label');

        try {
            await navigator.clipboard.writeText(sessionId);
        } catch (err) {
            const textArea = document.createElement('textarea');
            textArea.value = sessionId;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }

        const originalText = label.textContent;
        label.textContent = '✓ ' + i18n.t('session.copy.success');
        btn.classList.add('copied');
        setTimeout(() => {
            label.textContent = originalText;
            btn.classList.remove('copied');
        }, 2000);
    });

    // chat - send message
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
 * sets up websocket event listeners
 */
function setupSocketEventListeners() {
    // participants updated
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

    // voting started
    socketManager.on('voting-started', (data) => {
        uiManager.showVotingArea(data.timerDuration, data.timerStartedAt, socketManager.isCreator, data.deckType);
    });

    // user has voted
    socketManager.on('user-voted', (data) => {
        uiManager.markUserVoted(data.userId);

        // update reveal controls if user is creator
        if (socketManager.isCreator && data.totalVotes !== undefined) {
            uiManager.updateRevealControls(data.allVoted, data.totalVotes, data.totalParticipants);
        }
    });

    // votes revealed
    socketManager.on('votes-revealed', (results) => {
        uiManager.showResults(results);
    });

    // explanation submitted
    socketManager.on('explanation-submitted', (data) => {
        // find username from participant list
        const participantItem = document.querySelector(`[data-user-id="${data.userId}"]`);
        const username = participantItem ?
            participantItem.textContent.replace('👤', '').trim().replace('✓', '').trim() :
            'Unknown';

        uiManager.addExplanation(data.userId, username, data.explanation);
    });

    // voting reset
    // round reset
    socketManager.on('round-reset', (data) => {
        uiManager.resetView();

        // show timer controls for creator to start new voting
        if (socketManager.isCreator) {
            document.getElementById('timer-controls').classList.remove('hidden');
        }

        // show waiting message until creator starts voting
        if (!socketManager.isCreator) {
            document.getElementById('waiting-message').classList.remove('hidden');
            document.getElementById('voting-area').classList.add('hidden');
        }
    });

    // kicked from session
    socketManager.on('kicked', () => {
        alert(i18n.t('admin.kicked.message'));
        window.location.reload();
    });

    // chat message received
    socketManager.on('chat-message', (chatMessage) => {
        console.log('Chat message received:', chatMessage);
        uiManager.addChatMessage(chatMessage);
    });

    // chat history received
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

// start application when dom is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
