/**
 * ui management module
 * handles dom manipulation and visual updates
 */

import { i18n } from './i18n.js';

export class UIManager {
    constructor() {
        this.currentScreen = 'welcome';
        this.selectedVote = null;
        this.timerInterval = null;
        this.timerEndTime = null;
        this.isCreator = false; // Track if user is session creator
    }

    /**
     * switches between screens
     */
    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        const screen = document.getElementById(`${screenName}-screen`);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenName;
        }
    }

    /**
     * displays session information
     */
    displaySessionInfo(sessionId, username, isCreator = false) {
        document.getElementById('session-id-display').textContent = sessionId;
        document.getElementById('username-display').textContent = username;

        // Store creator status
        this.isCreator = isCreator;

        // Show end session button for creator
        const endSessionBtn = document.getElementById('end-session-btn');
        if (isCreator) {
            endSessionBtn.classList.remove('hidden');
        }

        // Show waiting message for non-creators, hide timer controls
        const waitingMessage = document.getElementById('waiting-message');
        const timerControls = document.getElementById('timer-controls');

        if (!isCreator) {
            timerControls.classList.add('hidden');
            waitingMessage.classList.remove('hidden');
        } else {
            waitingMessage.classList.add('hidden');
        }
    }

    /**
     * updates participant list
     */
    updateParticipants(participants, isCreator = false, currentUserId = null) {
        const listElement = document.getElementById('participants-list');
        const countElement = document.getElementById('participant-count');

        countElement.textContent = participants.length;

        listElement.innerHTML = participants.map(p => {
            const isHost = p.isCreator;
            const hostBadge = isHost ? '<span class="host-badge">HOST</span>' : '';
            const hostClass = isHost ? 'host' : '';

            return `
                <div class="participant-item ${hostClass}" data-user-id="${p.id}">
                    👤 ${p.username} ${hostBadge}
                    ${isCreator && p.id !== currentUserId ? `<button class="kick-btn" data-kick-user-id="${p.id}" title="${i18n.t('admin.kick.button')}">❌</button>` : ''}
                </div>
            `;
        }).join('');
    }

    /**
     * marks that user has voted
     */
    markUserVoted(userId) {
        const participantItem = document.querySelector(`[data-user-id="${userId}"]`);
        if (participantItem) {
            participantItem.classList.add('voted');
        }
    }

    /**
     * shows voting area and hides controls
     */
    showVotingArea(timerDuration, timerStartedAt, isCreator = false, roundInfo = null) {
        // Hide waiting message and controls
        document.getElementById('waiting-message').classList.add('hidden');
        document.getElementById('timer-controls').classList.add('hidden');

        // Show voting area
        document.getElementById('voting-area').classList.remove('hidden');

        // show reveal controls for creator
        if (isCreator) {
            document.getElementById('reveal-controls').classList.remove('hidden');
        }

        // start timer if exists
        if (timerDuration > 0 && timerStartedAt) {
            this.startTimer(timerDuration, new Date(timerStartedAt));
        }
    }

    /**
     * starts and displays timer
     */
    startTimer(durationSeconds, startedAt) {
        const timerDisplay = document.getElementById('timer-display');
        const timerValue = document.getElementById('timer-value');
        const timerProgress = document.getElementById('timer-progress');

        timerDisplay.classList.remove('hidden');

        // calculate when timer ends
        this.timerEndTime = new Date(startedAt.getTime() + durationSeconds * 1000);

        const circumference = 2 * Math.PI * 45; // radius = 45

        const updateTimer = () => {
            const now = new Date();
            const remainingMs = this.timerEndTime - now;

            if (remainingMs <= 0) {
                timerValue.textContent = '0:00';
                timerProgress.style.strokeDashoffset = circumference;
                clearInterval(this.timerInterval);
                return;
            }

            const remainingSeconds = Math.ceil(remainingMs / 1000);
            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;

            timerValue.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            // update progress circle
            const progress = remainingSeconds / durationSeconds;
            const offset = circumference * (1 - progress);
            timerProgress.style.strokeDashoffset = offset;
        };

        updateTimer(); // initial update
        this.timerInterval = setInterval(updateTimer, 1000);
    }

    /**
     * stops timer
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        document.getElementById('timer-display').classList.add('hidden');
    }

    /**
     * handles card selection
     */
    handleCardSelection(card) {
        // remove previous selection
        document.querySelectorAll('.card').forEach(c => {
            c.classList.remove('selected');
        });

        // mark selected card
        card.classList.add('selected');
        this.selectedVote = card.dataset.value;

        // update status
        document.getElementById('vote-status').textContent = `${i18n.t('voting.status.selected')} ${this.selectedVote}`;
    }

    /**
     * updates reveal controls based on vote stats
     */
    updateRevealControls(allVoted, totalVotes, totalParticipants) {
        const hint = document.getElementById('reveal-hint');

        if (allVoted) {
            hint.textContent = i18n.t('voting.reveal.hint.ready');
            hint.classList.add('all-voted');
        } else {
            // Show vote count with waiting message
            const waitingText = i18n.getLanguage() === 'sv' ? 'har röstat...' : 'have voted...';
            hint.textContent = `${totalVotes}/${totalParticipants} ${waitingText}`;
            hint.classList.remove('all-voted');
        }
    }

    /**
     * shows results
     */
    showResults(results) {
        // Stoppa timer
        this.stopTimer();

        // hide voting area
        document.getElementById('voting-area').classList.add('hidden');

        // show results area
        const resultsArea = document.getElementById('results-area');
        const resultsGrid = document.getElementById('results-grid');

        resultsArea.classList.remove('hidden');

        // Calculate statistics
        const voteStats = {};
        const totalVotes = results.votes.length;

        results.votes.forEach(vote => {
            if (!voteStats[vote.vote]) {
                voteStats[vote.vote] = {
                    value: vote.vote,
                    count: 0,
                    participants: []
                };
            }
            voteStats[vote.vote].count++;
            voteStats[vote.vote].participants.push(vote.username);
        });

        // Sort by count (most popular first)
        const sortedStats = Object.values(voteStats).sort((a, b) => b.count - a.count);

        // Build HTML with statistics
        let html = '<div class="vote-statistics"><h3>Vote Statistics</h3>';

        sortedStats.forEach(stat => {
            const percentage = ((stat.count / totalVotes) * 100).toFixed(1);
            html += `
                <div class="stat-item">
                    <div class="stat-header">
                        <span class="stat-value">${stat.value}</span>
                        <span class="stat-count">${stat.count} vote${stat.count !== 1 ? 's' : ''} (${percentage}%)</span>
                    </div>
                    <div class="stat-bar">
                        <div class="stat-bar-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="stat-participants">${stat.participants.join(', ')}</div>
                </div>
            `;
        });

        html += '</div>';

        // Add individual votes
        html += '<div class="individual-votes"><h3>Individual Votes</h3>';
        html += results.votes.map(v => `
            <div class="result-card">
                <div class="username">${v.username}</div>
                <div class="vote">${v.vote}</div>
            </div>
        `).join('');
        html += '</div>';

        resultsGrid.innerHTML = html;

        // show admin controls if user is creator
        if (this.isCreator) {
            const adminControls = document.getElementById('admin-controls');
            if (adminControls) {
                adminControls.classList.remove('hidden');
            }
        }
    }


    /**
     * adds explanation to list
     */
    addExplanation(userId, username, explanation) {
        const list = document.getElementById('explanations-list');

        const item = document.createElement('div');
        item.className = 'explanation-item';
        item.innerHTML = `
      <div class="username">${username}</div>
      <div class="text">${explanation}</div>
    `;

        list.appendChild(item);
    }

    /**
     * resets ui for new voting
     */
    resetForNewRound() {
        // stop timer
        this.stopTimer();

        // clear selection
        this.selectedVote = null;
        document.querySelectorAll('.card').forEach(c => {
            c.classList.remove('selected');
        });

    }

    /**
     * resets view for new round
     */
    resetView() {
        // hide results and admin controls
        document.getElementById('results-area').classList.add('hidden');
        const adminControls = document.getElementById('admin-controls');
        if (adminControls) {
            adminControls.classList.add('hidden');
        }
        document.getElementById('reveal-controls').classList.add('hidden');

        // Visa röstningsområde - VÄNTA! Vi visar inte detta förrän röstningen startar
        // const votingArea = document.getElementById('voting-area');
        // votingArea.classList.remove('hidden');

        // Ensure voting area is hidden
        document.getElementById('voting-area').classList.add('hidden');

        // clear selected cards
        document.querySelectorAll('.card').forEach(card => {
            card.classList.remove('selected');
        });

        // clear voted marks from participants
        document.querySelectorAll('.participant-item').forEach(p => {
            p.classList.remove('voted');
        });

        // reset vote status in participant list (if status-icon used)
        document.querySelectorAll('.status-icon').forEach(icon => {
            icon.textContent = '';
            icon.className = 'status-icon';
        });

        // Reset waiting message
        document.getElementById('waiting-message').classList.add('hidden');

        // Reset round title
        const roundTitle = document.getElementById('round-title');
        if (roundTitle) {
            roundTitle.textContent = i18n.t('voting.heading');
        }
    }

    /**
     * shows error message
     */
    showError(message) {
        alert(message); // simple implementation - can improve with toast/modal
    }

    /**
     * shows success message
     */
    showSuccess(message) {
        console.log('Success:', message);
    }

    /**
     * adds chat message
     */
    addChatMessage(chatMessage) {
        console.log('Adding chat message to UI:', chatMessage);
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) {
            console.error('chat-messages element not found!');
            return;
        }

        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message';
        messageEl.style.display = 'block'; // Force display
        messageEl.style.marginBottom = '8px'; // Ensure spacing

        const time = new Date(chatMessage.timestamp).toLocaleTimeString('sv-SE', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Create elements instead of innerHTML for better debugging
        const header = document.createElement('div');
        header.className = 'chat-message-header';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';

        const username = document.createElement('span');
        username.className = 'chat-username';
        username.textContent = chatMessage.username;
        username.style.color = 'var(--primary-light)';

        const timeSpan = document.createElement('span');
        timeSpan.className = 'chat-time';
        timeSpan.textContent = time;
        timeSpan.style.color = 'var(--text-muted)';

        header.appendChild(username);
        header.appendChild(timeSpan);

        const text = document.createElement('div');
        text.className = 'chat-message-text';
        text.textContent = chatMessage.message;
        text.style.color = 'var(--text-primary)';
        text.style.marginTop = '4px';

        messageEl.appendChild(header);
        messageEl.appendChild(text);

        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        console.log('Chat message added successfully, total messages:', chatMessages.children.length);
    }

    /**
     * Rensar chattmeddelanden
     */
    clearChat() {
        document.getElementById('chat-messages').innerHTML = '';
    }
}
