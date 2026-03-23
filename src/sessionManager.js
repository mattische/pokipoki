/**
 * session management module
 * handles sessions, participants, and timer
 */

import { randomBytes } from 'crypto';

// in-memory session storage
const sessions = new Map();

/**
 * creates new poker planning session
 * @param {string} creatorName - creator name
 * @returns {Object} session object with sessionId and token
 */
export function createSession(creatorName, theme = 'modern', deckType = 'fibonacci') {
    const sessionId = generateSessionId();

    const session = {
        id: sessionId,
        createdAt: new Date(),
        creatorId: null, // set when creator joins
        theme: theme,
        deckType: deckType,
        participants: new Map(),
        currentRound: {
            active: false,
            roundNumber: 0,
            votes: new Map(),
            revealed: false,
            timer: null,
            timerDuration: 0,
            timerStartedAt: null
        },
        chatMessages: [],
        roundHistory: []
    };

    sessions.set(sessionId, session);
    console.log(`Session created: ${sessionId} with theme: ${theme}`);

    return { sessionId, session };
}

/**
 * adds participant to session
 * @param {string} sessionId - session id
 * @param {string} userId - user id
 * @param {string} username - username
 * @returns {boolean} true if successful
 */
export function joinSession(sessionId, userId, username) {
    const session = sessions.get(sessionId);
    if (!session) {
        return false;
    }

    // set creatorId if first participant
    // first participant will be "host" session id is created
    if (session.participants.size === 0) {
        session.creatorId = userId;
    }

    session.participants.set(userId, {
        id: userId,
        username,
        joinedAt: new Date(),
        connected: true
    });

    console.log(`User ${username} joined session ${sessionId}`);
    return true;
}

/**
 * removes participant from session
 * @param {string} sessionId - session id
 * @param {string} userId - user id
 */
export function leaveSession(sessionId, userId) {
    const session = sessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.get(userId);
    if (participant) {
        session.participants.delete(userId);
        console.log(`User ${participant.username} left session ${sessionId}`);

        // remove session if empty
        if (session.participants.size === 0) {
            sessions.delete(sessionId);
            console.log(`Session ${sessionId} removed (empty)`);
        }
    }
}

/**
 * gets session
 * @param {string} sessionId - session id
 * @returns {Object|null} session object or null
 */
export function getSession(sessionId) {
    return sessions.get(sessionId) || null;
}

/**
 * sets participant vote
 * @param {string} sessionId - session id
 * @param {string} userId - user id
 * @param {string} vote - vote value (card)
 * @returns {boolean} true if successful
 */
export function setVote(sessionId, userId, vote) {
    const session = sessions.get(sessionId);
    if (!session || !session.currentRound.active) {
        return false;
    }

    session.currentRound.votes.set(userId, vote);
    return true;
}

/**
 * starts new voting round with timer and optional topic
 * @param {string} sessionId - session id
 * @param {number} timerDuration - timer in seconds (0 = no timer)
 * @param {string} topic - optional markdown topic text
 * @returns {boolean} true if successful
 */
export function startVoting(sessionId, timerDuration = 0, topic = '') {
    const session = sessions.get(sessionId);
    if (!session) {
        return false;
    }

    const nextRoundNumber = (session.currentRound.roundNumber || 0) + 1;
    const hasReadPhase = topic.trim().length > 0;

    session.currentRound = {
        active: !hasReadPhase, // stays inactive until read phase completes
        roundNumber: nextRoundNumber,
        votes: new Map(),
        revealed: false,
        timer: null,
        timerDuration,
        timerStartedAt: hasReadPhase ? null : (timerDuration > 0 ? new Date() : null),
        topic: topic.trim(),
        readConfirmations: new Set(),
        readPhase: hasReadPhase,
        countdownStarted: false,
        discussionPhase: false,
        currentSpeaker: null,
        explanations: new Map()
    };

    console.log(`Round started in session ${sessionId}, round: ${nextRoundNumber}, timer: ${timerDuration}s, readPhase: ${hasReadPhase}`);
    return true;
}

/**
 * confirms a participant has read the round topic
 * @param {string} sessionId - session id
 * @param {string} userId - user id
 * @returns {Object|null} read confirmation state
 */
export function confirmRead(sessionId, userId) {
    const session = sessions.get(sessionId);
    if (!session || !session.currentRound.readPhase) return null;

    session.currentRound.readConfirmations.add(userId);

    const confirmed = session.currentRound.readConfirmations.size;
    const total = session.participants.size;
    const confirmedNames = Array.from(session.currentRound.readConfirmations)
        .map(uid => session.participants.get(uid)?.username || 'Unknown');

    return { confirmed, total, allConfirmed: confirmed >= total, confirmedNames };
}

/**
 * activates voting after read phase / countdown
 * @param {string} sessionId - session id
 * @returns {Date|null} timerStartedAt
 */
export function activateVoting(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) return null;

    session.currentRound.active = true;
    session.currentRound.readPhase = false;
    if (session.currentRound.timerDuration > 0) {
        session.currentRound.timerStartedAt = new Date();
    }
    return session.currentRound.timerStartedAt;
}

/**
 * reveals all votes (manual or timer)
 * @param {string} sessionId - session id
 * @returns {Object|null} vote results
 */
export function revealVotes(sessionId) {
    const session = sessions.get(sessionId);
    if (!session || !session.currentRound.active) {
        return null;
    }

    session.currentRound.revealed = true;

    const results = {
        votes: Array.from(session.currentRound.votes.entries()).map(([userId, vote]) => ({
            userId,
            username: session.participants.get(userId)?.username || 'Unknown',
            vote
        }))
    };

    console.log(`Votes revealed in session ${sessionId}`);
    return results;
}

/**
 * resets voting round for new vote
 * @param {string} sessionId - session id
 */
export function resetRound(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) return;

    // save round to history if revealed
    if (session.currentRound.revealed && session.currentRound.votes.size > 0) {
        const roundSummary = {
            roundNumber: session.currentRound.roundNumber,
            topic: session.currentRound.topic || '',
            votes: Array.from(session.currentRound.votes.entries()).map(([userId, vote]) => ({
                userId,
                username: session.participants.get(userId)?.username || 'Unknown',
                vote
            })),
            timestamp: new Date()
        };
        session.roundHistory.push(roundSummary);
    }

    session.currentRound = {
        active: false,
        roundNumber: session.currentRound.roundNumber, // keep round number for next start
        votes: new Map(),
        revealed: false,
        timer: null,
        timerDuration: 0,
        timerStartedAt: null
    };

    console.log(`Round reset in session ${sessionId}`);
}

/**
 * generates unique session id
 * @returns {string} session id
 */
function generateSessionId() {
    return randomBytes(4).toString('hex').toUpperCase();
}

/**
 * gets all session participants
 * @param {string} sessionId - session id
 * @returns {Array} participant list
 */
export function getParticipants(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) return [];

    return Array.from(session.participants.values());
}

/**
 * checks if session exists
 * @param {string} sessionId - session id
 * @returns {boolean}
 */
export function sessionExists(sessionId) {
    return sessions.has(sessionId);
}

/**
 * adds chat message to session
 * @param {string} sessionId - session id
 * @param {string} userId - user id
 * @param {string} message - message text
 * @returns {Object|null} message object or null
 */
export function addChatMessage(sessionId, userId, message) {
    const session = sessions.get(sessionId);
    if (!session) return null;

    const participant = session.participants.get(userId);
    if (!participant) return null;

    const chatMessage = {
        id: Date.now().toString(),
        userId,
        username: participant.username,
        message,
        timestamp: new Date()
    };

    session.chatMessages.push(chatMessage);
    return chatMessage;
}

/**
 * gets all chat messages for session
 * @param {string} sessionId - session id
 * @returns {Array} chat message list
 */
export function getChatMessages(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) return [];
    return session.chatMessages;
}

/**
 * gets round history for session
 * @param {string} sessionId - session id
 * @returns {Array} completed round list
 */
export function getRoundHistory(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) return [];
    return session.roundHistory;
}
/**
 * updates session theme
 * @param {string} sessionId - session id
 * @param {string} theme - theme name (modern, flat, retro)
 */
export function setTheme(sessionId, theme) {
    const session = sessions.get(sessionId);
    if (session) {
        session.theme = theme;
        console.log(`Session ${sessionId} theme updated to: ${theme}`);
        return true;
    }
    return false;
}

/**
 * deletes session
 * @param {string} sessionId - session id
 */
export function deleteSession(sessionId) {
    const session = sessions.get(sessionId);
    if (session) {
        // stop timer if active
        if (session.currentRound.timer) {
            clearTimeout(session.currentRound.timer);
        }
        sessions.delete(sessionId);
        console.log(`Session ${sessionId} deleted`);
        return true;
    }
    return false;
}
