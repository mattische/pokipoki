/**
 * Sessionshanteringsmodul
 * Hanterar poker planning-sessioner, deltagare, och timer-funktionalitet
 */

import { randomBytes } from 'crypto';

// In-memory datalagring för sessioner
const sessions = new Map();

/**
 * Skapar en ny poker planning session
 * @param {string} creatorName - Namnet på personen som skapar sessionen
 * @returns {Object} Session-objekt med sessionId och token
 */
export function createSession(creatorName, theme = 'modern') {
    const sessionId = generateSessionId();

    const session = {
        id: sessionId,
        createdAt: new Date(),
        creatorId: null, // Sätts när skaparen går med
        theme: theme, // Store selected theme
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
 * Lägger till en deltagare i en session
 * @param {string} sessionId - Session ID
 * @param {string} userId - Användar ID
 * @param {string} username - Användarnamn
 * @returns {boolean} true om lyckad, annars false
 */
export function joinSession(sessionId, userId, username) {
    const session = sessions.get(sessionId);
    if (!session) {
        return false;
    }

    // Sätt creatorId om detta är första deltagaren
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
 * Tar bort en deltagare från en session
 * @param {string} sessionId - Session ID
 * @param {string} userId - Användar ID
 */
export function leaveSession(sessionId, userId) {
    const session = sessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.get(userId);
    if (participant) {
        session.participants.delete(userId);
        console.log(`User ${participant.username} left session ${sessionId}`);

        // Ta bort sessionen om den är tom
        if (session.participants.size === 0) {
            sessions.delete(sessionId);
            console.log(`Session ${sessionId} removed (empty)`);
        }
    }
}

/**
 * Hämtar en session
 * @param {string} sessionId - Session ID
 * @returns {Object|null} Session-objekt eller null
 */
export function getSession(sessionId) {
    return sessions.get(sessionId) || null;
}

/**
 * Sätter en deltagares röst
 * @param {string} sessionId - Session ID
 * @param {string} userId - Användar ID
 * @param {string} vote - Röstvärde (kort)
 * @returns {boolean} true om lyckad
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
 * Startar en ny röstningsomgång med timer
 * @param {string} sessionId - Session ID
 * @param {number} timerDuration - Timer i sekunder (0 = ingen timer)
 * @returns {boolean} true om lyckad
 */
export function startVoting(sessionId, timerDuration = 0) {
    const session = sessions.get(sessionId);
    if (!session) {
        return false;
    }

    const nextRoundNumber = (session.currentRound.roundNumber || 0) + 1;

    session.currentRound = {
        active: true,
        roundNumber: nextRoundNumber,
        votes: new Map(),
        revealed: false,
        timer: null,
        timerDuration,
        timerStartedAt: timerDuration > 0 ? new Date() : null,
        discussionPhase: false,
        currentSpeaker: null,
        explanations: new Map()
    };

    console.log(`Voting started in session ${sessionId}, round: ${nextRoundNumber}, timer: ${timerDuration}s`);
    return true;
}

/**
 * Avslöjar alla röster (manuellt eller när timer går ut)
 * @param {string} sessionId - Session ID
 * @returns {Object|null} Röstresultat
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
 * Återställer röstningsomgången för ny omröstning
 * @param {string} sessionId - Session ID
 */
export function resetRound(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) return;

    // Save current round to history if it was revealed
    if (session.currentRound.revealed && session.currentRound.votes.size > 0) {
        const roundSummary = {
            roundNumber: session.currentRound.roundNumber,
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
        roundNumber: session.currentRound.roundNumber, // Behåll runda-numret till nästa start
        votes: new Map(),
        revealed: false,
        timer: null,
        timerDuration: 0,
        timerStartedAt: null
    };

    console.log(`Round reset in session ${sessionId}`);
}

/**
 * Genererar ett unikt session ID
 * @returns {string} Session ID
 */
function generateSessionId() {
    return randomBytes(4).toString('hex').toUpperCase();
}

/**
 * Hämtar alla deltagare i en session
 * @param {string} sessionId - Session ID
 * @returns {Array} Lista av deltagare
 */
export function getParticipants(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) return [];

    return Array.from(session.participants.values());
}

/**
 * Kontrollerar om en session existerar
 * @param {string} sessionId - Session ID
 * @returns {boolean}
 */
export function sessionExists(sessionId) {
    return sessions.has(sessionId);
}

/**
 * Lägger till ett chattmeddelande i sessionen
 * @param {string} sessionId - Session ID
 * @param {string} userId - Användar ID
 * @param {string} message - Meddelande
 * @returns {Object|null} Meddelandeobjekt eller null
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
 * Hämtar alla chattmeddelanden för en session
 * @param {string} sessionId - Session ID
 * @returns {Array} Lista av chattmeddelanden
 */
export function getChatMessages(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) return [];
    return session.chatMessages;
}

/**
 * Hämtar rundhistorik för en session
 * @param {string} sessionId - Session ID
 * @returns {Array} Lista av avslutade rundor
 */
export function getRoundHistory(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) return [];
    return session.roundHistory;
}
/**
 * Uppdaterar tema för en session
 * @param {string} sessionId - Session ID
 * @param {string} theme - Tema namn (modern, flat, retro)
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
 * Tar bort en session
 * @param {string} sessionId - Session ID
 */
export function deleteSession(sessionId) {
    const session = sessions.get(sessionId);
    if (session) {
        // Stoppa eventuell timer
        if (session.currentRound.timer) {
            clearTimeout(session.currentRound.timer);
        }
        sessions.delete(sessionId);
        console.log(`Session ${sessionId} deleted`);
        return true;
    }
    return false;
}
