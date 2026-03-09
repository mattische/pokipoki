# Server - Sessioner, Användare & Voting

## Arkitektur

Servern bygger på **Express + Socket.IO** med sessionsdata i minnet (ingen databas).

```
server.js          → HTTP-server + statiska filer
src/auth.js        → JWT-autentisering
src/sessionManager.js → Session/användare/voting-logik
src/socketHandler.js  → WebSocket-eventhantering
```

---

## Datastrukturer

```js
// Session-objekt (sessionManager.js)
{
  id: "a3f8b2c1",           // 8 hex-tecken
  creatorId: "socket-id",    // Skaparen äger sessionen
  theme: "modern",
  participants: Map<userId, {
    id, username, joinedAt, connected
  }>,
  currentRound: {
    active: false,
    roundNumber: 0,
    votes: Map<userId, vote>,
    revealed: false,
    timer: null,
    timerDuration: 0,
    timerStartedAt: null
  },
  chatMessages: [],
  roundHistory: []
}
```

---

## Server startar, första användaren som skapar en session

---

### 2. Användare ansluter via WebSocket

Socket.IO upprättar anslutning automatiskt. Servern registrerar alla event-lyssnare:

```js
// socketHandler.js
io.on('connection', (socket) => {
  let currentUserId = null;
  let currentSessionId = null;
  // ... registrerar alla event-handlers
});
```

---

### 3. Användaren skapar en session

**Event:** `join-session` med `{ username, theme, create: true }`

```js
socket.on('join-session', (data, callback) => {
  const { username, sessionId, create } = data;
  const userId = socket.id;

  if (create || !sessionId) { //ny 'session'
    const theme = data.theme;
    // session skapas
    const { sessionId: newSessionId } = createSession(username, theme);
    const session = getSession(newSessionId);

    joinSession(newSessionId, userId, username);
    session.creatorId = userId;
    socket.join(newSessionId);       // Socket.IO-rum

    currentUserId = userId;
    currentSessionId = newSessionId;

    callback({
      success: true,
      sessionId: newSessionId,
      userId,
      isCreator: true
    });

    io.to(newSessionId).emit('theme-changed', theme);
    emitParticipantsUpdate(io, newSessionId);
  }
});
```

---

`createSession` i sessionManager genereras ett unikt ID och returnerar sessionen:

```js
createSession(creatorName, theme) {
  const sessionId = crypto.randomBytes(4).toString('hex').toUpperCase();
  sessions.set(sessionId, { id: sessionId, createdAt: new Date(), ... });
  return { sessionId, session: sessions.get(sessionId) };
}
```

---

### 4. Deltagarlistan uppdateras

```js
function emitParticipantsUpdate(io, sessionId) {
  const participants = getParticipants(sessionId);
  const session = getSession(sessionId);

  const participantsWithCreatorFlag = participants.map(p => ({
    ...p,
    isCreator: p.id === session.creatorId
  }));
  io.to(sessionId).emit('participants-updated', participantsWithCreatorFlag);
}
```

> Sessionen skapas, skaparen sitter i ett Socket.IO-rum och alla klienter i rummet får uppdaterad deltagarlista.

---

## Flöde 2: Fler användare ansluter

**Event:** `join-session` med `{ sessionId, username, create: false }`

```js
// Fortsättning i join-session-handler:
if (!sessionExists(sessionId)) {
  callback({ success: false, error: 'Session finns inte' });
  return;
}

joinSession(sessionId, userId, username);
socket.join(sessionId);

currentUserId = userId;
currentSessionId = sessionId;

const session = getSession(sessionId);
callback({
  success: true, sessionId, userId,
  isCreator: session.creatorId === userId
});

// Skicka aktuellt tema
if (session.theme) socket.emit('theme-changed', session.theme);

// Skicka chatthistorik till den nya användaren
socket.emit('chat-history', getChatMessages(sessionId));

// Om voting pågår, synka state
if (session.currentRound.active) {
  socket.emit('voting-started', {
    timerDuration: session.currentRound.timerDuration,
    timerStartedAt: session.currentRound.timerStartedAt,
    roundNumber: session.currentRound.roundNumber
  });
}

// Alla i rummet får uppdaterad lista
emitParticipantsUpdate(io, sessionId);
```

> Nya deltagare synkas direkt med pågående voting, tema och chatthistorik.

---

## Flöde 3: Voting-session startar och avslutas

### Steg 1: Skaparen startar voting

**Event:** `start-voting` med `{ timerDuration }`

```js
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

  // Auto-reveal vid timer
  if (timerDuration > 0) {
    setTimeout(() => {
      handleRevealVotes(io, currentSessionId);
    }, timerDuration * 1000);
  }
});
```

### Steg 2: Deltagare röstar

**Event:** `submit-vote` med `{ vote }`

```js
socket.on('submit-vote', (data) => {
  if (!currentSessionId || !currentUserId) return;
  const { vote } = data;
  setVote(currentSessionId, currentUserId, vote);

  // Broadcastar BARA att användaren röstat, inte värdet
  io.to(currentSessionId).emit('user-voted', { userId: currentUserId });
});
```

> Rösterna hålls hemliga tills reveal sker.

### Steg 3: Röster avslöjas

Sker antingen manuellt (skaparen klickar) eller automatiskt (timer löper ut).

**Event:** `reveal-votes`

```js
socket.on('reveal-votes', () => {
  if (!currentSessionId) return;
  handleRevealVotes(io, currentSessionId);
});

function handleRevealVotes(io, sessionId) {
  const results = revealVotes(sessionId);
  if (results) {
    io.to(sessionId).emit('votes-revealed', results);
  }
}
```

`revealVotes` returnerar:

```js
{
  votes: [
    { userId: "abc", username: "Anna", vote: "5" },
    { userId: "def", username: "Erik", vote: "8" }
  ]
}
```

### Steg 4: Ny runda

**Event:** `reset-round`

```js
socket.on('reset-round', () => {
  if (!currentSessionId) return;
  resetRound(currentSessionId);          // Sparar till roundHistory, nollställer
  const roundHistory = getRoundHistory(currentSessionId);
  io.to(currentSessionId).emit('round-reset', { roundHistory });
});
```

---

## Event-sammanfattning

| Event (klient → server) | Beskrivning | Broadcast (server → klienter) |
|---|---|---|
| `join-session` | Skapa/gå med i session | `participants-updated`, `theme-changed` |
| `start-voting` | Starta röstningsrunda | `voting-started` |
| `submit-vote` | Skicka röst | `user-voted` (bara userId) |
| `reveal-votes` | Avslöja alla röster | `votes-revealed` |
| `reset-round` | Ny runda | `round-reset` |
| `send-message` | Chattmeddelande | `chat-message` |
| `kick-user` | Sparka deltagare | `kicked` (till målet) |
| `end-session` | Avsluta session | `session-ended` |
| *(disconnect)* | Tappad anslutning | `session-ended` eller `participants-updated` |

---

## Disconnect-hantering

```js
socket.on('disconnect', () => {
  if (currentSessionId && currentUserId) {
    const session = getSession(currentSessionId);

    if (session && session.creatorId === currentUserId) {
      // Skaparen lämnar → hela sessionen avslutas
      io.to(currentSessionId).emit('session-ended');
      deleteSession(currentSessionId);
    } else {
      // Vanlig deltagare → tas bort ur sessionen
      leaveSession(currentSessionId, currentUserId);
      emitParticipantsUpdate(io, currentSessionId);
    }
  }
});
```

> Sessionen lever bara så länge skaparen är ansluten. Tomma sessioner rensas automatiskt av `leaveSession`.
