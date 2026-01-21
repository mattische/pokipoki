/**
 * websocket communication module
 * handles socket.io client connection and events
 */

export class SocketManager {
    constructor() {
        this.socket = null;
        this.sessionId = null;
        this.userId = null;
        this.username = null;
        this.isCreator = false; // if user is session creator
        this.eventHandlers = new Map();
    }

    /**
     * initializes socket.io connection
     */
    connect() {
        this.socket = io();

        this.socket.on('connect', () => {
            console.log('WebSocket connected');
        });

        this.socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
        });

        return this;
    }

    /**
     * creates new session
     */
    createSession(username, theme = 'modern') {
        return new Promise((resolve, reject) => {
            this.socket.emit('join-session', {
                username,
                theme,
                create: true
            }, (response) => {
                if (response.success) {
                    this.sessionId = response.sessionId;
                    this.userId = response.userId;
                    this.username = username;
                    this.isCreator = response.isCreator || false;
                    resolve(response);
                } else {
                    reject(response.error);
                }
            });
        });
    }

    /**
     * joins existing session
     */
    async joinSession(sessionId, username) {
        return new Promise((resolve, reject) => {
            this.socket.emit('join-session', {
                sessionId: sessionId.toUpperCase(),
                username,
                create: false
            }, (response) => {
                if (response.success) {
                    this.sessionId = response.sessionId;
                    this.userId = response.userId;
                    this.username = username;
                    this.isCreator = response.isCreator || false;
                    resolve(response);
                } else {
                    reject(response.error);
                }
            });
        });
    }

    /**
     * starts voting round
     */
    startVoting(timerMinutes) {
        const timerDuration = timerMinutes * 60; // convert to seconds
        this.socket.emit('start-voting', { timerDuration });
    }

    /**
     * submits vote
     */
    submitVote(vote) {
        this.socket.emit('submit-vote', { vote });
    }

    /**
     * reveals votes manually
     */
    revealVotes() {
        this.socket.emit('reveal-votes');
    }



    /**
     * resets voting
     */
    resetRound() {
        this.socket.emit('reset-round');
    }

    /**
     * kicks user from session (creator only)
     */
    kickUser(userId) {
        this.socket.emit('kick-user', { userId });
    }

    /**
     * sends chat message
     */
    sendMessage(message) {
        this.socket.emit('send-message', { message });
    }

    /**
     * registers event handler
     */
    on(event, handler) {
        this.eventHandlers.set(event, handler);
        this.socket.on(event, handler);
    }

    /**
     * unregisters event handler
     */
    off(event) {
        const handler = this.eventHandlers.get(event);
        if (handler) {
            this.socket.off(event, handler);
            this.eventHandlers.delete(event);
        }
    }
}
