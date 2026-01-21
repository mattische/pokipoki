/**
 * WebSocket kommunikationsmodul
 * Hanterar Socket.IO klient-anslutning och events
 */

export class SocketManager {
    constructor() {
        this.socket = null;
        this.sessionId = null;
        this.userId = null;
        this.username = null;
        this.isCreator = false; // Om användaren är sessionsskapare
        this.eventHandlers = new Map();
    }

    /**
     * Initierar Socket.IO-anslutning
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
     * Skapar en ny session
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
     * Går med i en befintlig session
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
     * Startar en röstningsomgång
     */
    startVoting(timerMinutes) {
        const timerDuration = timerMinutes * 60; // Konvertera till sekunder
        this.socket.emit('start-voting', { timerDuration });
    }

    /**
     * Skickar in sin röst
     */
    submitVote(vote) {
        this.socket.emit('submit-vote', { vote });
    }

    /**
     * Avslöjar röster manuellt
     */
    revealVotes() {
        this.socket.emit('reveal-votes');
    }



    /**
     * Återställer omröstningen
     */
    resetRound() {
        this.socket.emit('reset-round');
    }

    /**
     * Kickar en användare från sessionen (endast för sessionsskapare)
     */
    kickUser(userId) {
        this.socket.emit('kick-user', { userId });
    }

    /**
     * Skickar ett chattmeddelande
     */
    sendMessage(message) {
        this.socket.emit('send-message', { message });
    }

    /**
     * Registrerar event-hanterare
     */
    on(event, handler) {
        this.eventHandlers.set(event, handler);
        this.socket.on(event, handler);
    }

    /**
     * Avregistrerar event-hanterare
     */
    off(event) {
        const handler = this.eventHandlers.get(event);
        if (handler) {
            this.socket.off(event, handler);
            this.eventHandlers.delete(event);
        }
    }
}
