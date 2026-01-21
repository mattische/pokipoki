/**
 * websocket event handler
 * handles socket.io events for realtime communication
 */

import {
    createSession,
    joinSession,
    leaveSession,
    getSession,
    setVote,
    startVoting,
    revealVotes,

    resetRound,
    getParticipants,
    sessionExists,
    addChatMessage,
    deleteSession,
    setTheme,
    getChatMessages,
    getRoundHistory
} from './sessionManager.js';
import { verifyToken, extractTokenFromSocket } from './auth.js';

/**
 * sets up socket.io event handlers
 * @param {Object} io - socket.io server instance
 */
export function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        let currentUserId = null;
        let currentSessionId = null;

        // authenticate on connect (if token exists)
        const token = extractTokenFromSocket(socket);
        if (token) {
            const payload = verifyToken(token);
            if (payload) {
                currentUserId = payload.userId;
                currentSessionId = payload.sessionId;
                console.log(`Authenticated user: ${currentUserId} in session ${currentSessionId}`);
            }
        }

        /**
         * handles session creation and joining
         */
        socket.on('join-session', (data, callback) => {
            const { username, sessionId, create } = data;
            const userId = socket.id;

            if (create || !sessionId) {
                // create new session
                const theme = data.theme || 'modern';
                const { sessionId: newSessionId } = createSession(username, theme);
                const session = getSession(newSessionId);

                joinSession(newSessionId, userId, username);
                session.creatorId = userId;
                socket.join(newSessionId);

                currentUserId = userId;
                currentSessionId = newSessionId;

                const sessionData = getSession(newSessionId);
                callback({
                    success: true,
                    sessionId: newSessionId,
                    userId,
                    isCreator: session.creatorId === userId
                });

                // Broadcast theme to all participants
                io.to(newSessionId).emit('theme-changed', theme);

                // Broadcast till alla i sessionen
                emitParticipantsUpdate(io, newSessionId);
            } else {
                // join existing session
                if (!sessionExists(sessionId)) {
                    callback({ success: false, error: 'Session finns inte' });
                    return;
                }

                const userId = socket.id;
                joinSession(sessionId, userId, username);
                socket.join(sessionId);

                currentUserId = userId;
                currentSessionId = sessionId;

                const session = getSession(sessionId);
                callback({
                    success: true,
                    sessionId,
                    userId,
                    isCreator: session.creatorId === userId
                });

                // Send current theme to new joiner
                if (session.theme) {
                    socket.emit('theme-changed', session.theme);
                }

                // Broadcast till alla i sessionen
                emitParticipantsUpdate(io, sessionId);

                // send current session status to new joiner
                if (session && session.currentRound.active) {
                    socket.emit('voting-started', {
                        timerDuration: session.currentRound.timerDuration,
                        timerStartedAt: session.currentRound.timerStartedAt,
                        revealed: session.currentRound.revealed,
                        roundNumber: session.currentRound.roundNumber
                    });
                }

                // send chat history to new joiner
                const chatMessages = getChatMessages(sessionId);
                socket.emit('chat-history', chatMessages);
            }
        });

        /**
         * starts new voting round
         */
        socket.on('start-voting', (data) => {
            if (!currentSessionId) return;

            const { timerDuration = 0 } = data;
            startVoting(currentSessionId, timerDuration);

            const session = getSession(currentSessionId);

            io.to(currentSessionId).emit('voting-started', {
                timerDuration,
                timerStartedAt: timerDuration > 0 ? new Date() : null,
                roundNumber: session.currentRound.roundNumber
            });

            // auto reveal if timer is set
            if (timerDuration > 0) {
                setTimeout(() => {
                    handleRevealVotes(io, currentSessionId);
                }, timerDuration * 1000);
            }
        });

        /**
         * handles user vote submission
         */
        socket.on('submit-vote', (data) => {
            if (!currentSessionId || !currentUserId) return;

            const { vote } = data;
            setVote(currentSessionId, currentUserId, vote);

            // broadcast that user voted (not the value)
            io.to(currentSessionId).emit('user-voted', {
                userId: currentUserId
            });
        });

        /**
         * reveals all votes manually
         */
        socket.on('reveal-votes', () => {
            if (!currentSessionId) return;
            handleRevealVotes(io, currentSessionId);
        });



        /**
         * resets voting round
         */
        socket.on('reset-round', () => {
            if (!currentSessionId) return;

            resetRound(currentSessionId);
            const roundHistory = getRoundHistory(currentSessionId);
            io.to(currentSessionId).emit('round-reset', { roundHistory });
        });

        /**
         * Kick a user from the session (creator only)
         */
        socket.on('kick-user', (data) => {
            if (!currentSessionId) return;

            const session = getSession(currentSessionId);
            if (!session || session.creatorId !== currentUserId) {
                // Only creator can kick users
                return;
            }

            const { userId } = data;
            if (userId && userId !== session.creatorId) {
                // Notify the kicked user
                io.to(userId).emit('kicked');

                // Remove from session
                leaveSession(currentSessionId, userId);

                // Forcefully disconnect the kicked user's socket
                const kickedSocket = io.sockets.sockets.get(userId);
                if (kickedSocket) {
                    kickedSocket.disconnect(true);
                }

                // Broadcast updated participants
                emitParticipantsUpdate(io, currentSessionId);
            }
        });

        /**
         * handles chat messages
         */
        socket.on('send-message', (data) => {
            console.log('=== SEND-MESSAGE EVENT RECEIVED ===');
            console.log('Data:', data);
            console.log('currentSessionId:', currentSessionId);
            console.log('currentUserId:', currentUserId);

            if (!currentSessionId || !currentUserId) {
                console.log('ERROR: Missing sessionId or userId');
                return;
            }

            const { message } = data;
            console.log('Message text:', message);

            if (!message || !message.trim()) {
                console.log('ERROR: Empty message');
                return;
            }

            const chatMessage = addChatMessage(currentSessionId, currentUserId, message.trim());
            console.log('Chat message created:', chatMessage);

            if (chatMessage) {
                // broadcast message to all in session
                console.log('Broadcasting to session:', currentSessionId);
                io.to(currentSessionId).emit('chat-message', chatMessage);
                console.log('Message broadcast complete');
            } else {
                console.log('ERROR: Failed to create chat message');
            }
            console.log('===================================');
        });

        /**
         * handles manual session end
         */
        socket.on('end-session', () => {
            if (!currentSessionId || !currentUserId) return;

            const session = getSession(currentSessionId);
            if (!session || session.creatorId !== currentUserId) {
                console.log('Only creator can end session');
                return;
            }

            console.log(`Session ${currentSessionId} ended by creator`);

            // Notify all participants
            io.to(currentSessionId).emit('session-ended');

            // Clean up session
            deleteSession(currentSessionId);
        });

        /**
         * handles disconnect
         */
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);

            if (currentSessionId && currentUserId) {
                const session = getSession(currentSessionId);

                // If creator disconnects, end the session
                if (session && session.creatorId === currentUserId) {
                    console.log(`Creator disconnected, ending session ${currentSessionId}`);
                    io.to(currentSessionId).emit('session-ended');
                    deleteSession(currentSessionId);
                } else {
                    // Regular participant disconnect
                    leaveSession(currentSessionId, currentUserId);
                    emitParticipantsUpdate(io, currentSessionId);
                }
            }
        });
    });
}
/**
 * helper: reveals votes and broadcasts results
 */
function handleRevealVotes(io, sessionId) {
    const results = revealVotes(sessionId);
    if (results) {
        io.to(sessionId).emit('votes-revealed', results);
    }
}

/**
 * Helper: Broadcastar uppdaterad deltagarlista
 */
function emitParticipantsUpdate(io, sessionId) {
    const participants = getParticipants(sessionId);
    const session = getSession(sessionId);

    if (participants && session) {
        const participantsWithCreatorFlag = participants.map(p => ({
            ...p,
            isCreator: p.id === session.creatorId
        }));
        io.to(sessionId).emit('participants-updated', participantsWithCreatorFlag);
    }
}

export default setupSocketHandlers;
