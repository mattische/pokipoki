# Klient - Anslutning, Sessioner, Voting & Chat

## Arkitektur

Klienten består av fyra moduler:

```
public/js/client.js       → Huvudorkestrering, kopplar ihop allt
public/js/socket.js        → SocketManager – WebSocket-kommunikation
public/js/ui.js            → UIManager – DOM-manipulation
public/js/i18n.js          → Språkstöd (sv/en)
public/js/themeManager.js  → Temahantering
```

---

## Initiering

```js
// client.js
function init() {
  socketManager.connect();           // WebSocket-anslutning
  setupUIEventListeners();           // Knappar, formulär
  setupSocketEventListeners();       // Lyssna på server-events
  i18n.updatePageTranslations();
  ThemeManager.init();
}
```

---

## Flöde 1: Anslut och skapa en session

### Steg 1: Användaren fyller i namn + tema och klickar "Skapa"

```js
// client.js – setupUIEventListeners()
document.getElementById('create-session-btn').addEventListener('click', async () => {
  const username = document.getElementById('username').value.trim();
  const theme = document.querySelector('.theme-option.selected')?.dataset.theme || 'modern';

  if (!username) { uiManager.showError(i18n.t('errors.enterName')); return; }

  const response = await socketManager.createSession(username, theme);
  // → skickar join-session till servern
});
```

### Steg 2: SocketManager skickar event

**Event:** `join-session` → servern

```js
// socket.js
createSession(username, theme = 'modern') {
  return new Promise((resolve, reject) => {
    this.socket.emit('join-session', {
      username, theme, create: true
    }, (response) => {
      if (response.success) {
        this.sessionId = response.sessionId;
        this.userId = response.userId;
        this.isCreator = response.isCreator;
        resolve(response);
      } else {
        reject(response.error);
      }
    });
  });
}
```

### Steg 3: UI uppdateras efter svar

```js
// client.js – efter createSession returnerar
uiManager.showScreen('planning');
uiManager.displaySessionInfo(response.sessionId, username, true);
```

### Steg 4: Lyssna på server-events

```js
// client.js – setupSocketEventListeners()
socketManager.on('participants-updated', (participants) => {
  uiManager.updateParticipants(participants, socketManager.isCreator, socketManager.userId);
});

socketManager.on('theme-changed', (theme) => {
  ThemeManager.applyTheme(theme);
});
```

**Event:** `participants-updated` ← servern

```js
// ui.js
updateParticipants(participants, isCreator, currentUserId) {
  const listElement = document.getElementById('participants-list');
  countElement.textContent = participants.length;

  listElement.innerHTML = participants.map(p => {
    const hostBadge = p.isCreator ? '<span class="host-badge">HOST</span>' : '';
    return `
      <div class="participant-item" data-user-id="${p.id}">
        ${p.username} ${hostBadge}
        ${isCreator && p.id !== currentUserId ?
          `<button class="kick-btn" data-kick-user-id="${p.id}">X</button>` : ''}
      </div>`;
  }).join('');
}
```

> **Resultat:** Skaparen ser planning-vyn med timer-kontroller och deltagarlista.

---

## Flöde 2: Ytterligare användare ansluter

### Steg 1: Användaren fyller i sessions-ID + namn och klickar "Gå med"

```js
document.getElementById('join-session-btn').addEventListener('click', async () => {
  const username = document.getElementById('join-username').value.trim();
  const sessionId = document.getElementById('session-id-input').value.trim();

  const response = await socketManager.joinSession(sessionId, username);
});
```

### Steg 2: SocketManager skickar event

**Event:** `join-session` → servern (med `create: false`)

```js
// socket.js
joinSession(sessionId, username) {
  return new Promise((resolve, reject) => {
    this.socket.emit('join-session', {
      sessionId: sessionId.toUpperCase(),
      username,
      create: false
    }, (response) => {
      if (response.success) {
        this.sessionId = response.sessionId;
        this.userId = response.userId;
        this.isCreator = response.isCreator;
        resolve(response);
      } else {
        reject(response.error);
      }
    });
  });
}
```

### Steg 3: Klienten tar emot synk-events från servern

```js
// Dessa events hanteras automatiskt av setupSocketEventListeners():

// 1. Deltagarlista
socketManager.on('participants-updated', (participants) => { ... });

// 2. Tema
socketManager.on('theme-changed', (theme) => {
  ThemeManager.applyTheme(theme);
});

// 3. Chatthistorik
socketManager.on('chat-history', (messages) => {
  messages.forEach(msg => uiManager.addChatMessage(msg));
});

// 4. Om voting pågår
socketManager.on('voting-started', (data) => {
  uiManager.showVotingArea(data.timerDuration, data.timerStartedAt, socketManager.isCreator);
});
```

> Ny användare synkas direkt med pågående session – tema, deltagare, chatt och aktiv voting.

---

## Flöde 3: Voting-session

### 3a. Skaparen startar voting

```js
// client.js
document.getElementById('start-voting-btn').addEventListener('click', () => {
  const timerMinutes = parseFloat(document.getElementById('timer-select').value) || 0;
  socketManager.startVoting(timerMinutes);
});
```

**Event:** `start-voting` → servern

```js
// socket.js
startVoting(timerMinutes) {
  const timerDuration = timerMinutes * 60;
  this.socket.emit('start-voting', { timerDuration });
}
```

### 3b. Alla klienter tar emot voting-started

**Event:** `voting-started` ← servern

```js
socketManager.on('voting-started', (data) => {
  uiManager.showVotingArea(data.timerDuration, data.timerStartedAt, socketManager.isCreator);
});
```

```js
// ui.js
showVotingArea(timerDuration, timerStartedAt, isCreator) {
  document.getElementById('waiting-message').classList.add('hidden');
  document.getElementById('voting-area').classList.remove('hidden');

  if (isCreator) {
    document.getElementById('reveal-controls').classList.remove('hidden');
  }

  if (timerDuration > 0 && timerStartedAt) {
    this.startTimer(timerDuration, new Date(timerStartedAt));
  }
}
```

### 3c. Deltagare röstar

Korten visas: `0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?, ∞`

```js
// client.js – klick på kort
document.getElementById('cards-container').addEventListener('click', (e) => {
  const card = e.target.closest('.card');
  if (!card) return;

  uiManager.handleCardSelection(card);
  socketManager.submitVote(card.dataset.value);
});
```

**Event:** `submit-vote` → servern

```js
// socket.js
submitVote(vote) {
  this.socket.emit('submit-vote', { vote });
}
```

**Event:** `user-voted` ← servern (bara userId, inte röstvärdet)

```js
socketManager.on('user-voted', (data) => {
  uiManager.markUserVoted(data.userId);
});
```

```js
// ui.js – visar bock vid deltagaren
markUserVoted(userId) {
  const participantItem = document.querySelector(`[data-user-id="${userId}"]`);
  if (participantItem) participantItem.classList.add('voted');
}
```

### 3d. Röster avslöjas

Sker manuellt (skaparen klickar) eller automatiskt (timer).

```js
// client.js
document.getElementById('reveal-btn').addEventListener('click', () => {
  socketManager.revealVotes();
});
```

**Event:** `reveal-votes` → servern

```js
// socket.js
revealVotes() {
  this.socket.emit('reveal-votes');
}
```

**Event:** `votes-revealed` ← servern

```js
socketManager.on('votes-revealed', (results) => {
  uiManager.showResults(results);
});
```

```js
// ui.js – visar resultat med statistik
showResults(results) {
  this.stopTimer();
  document.getElementById('voting-area').classList.add('hidden');
  document.getElementById('results-area').classList.remove('hidden');

  // Beräkna statistik per röstvärde
  const voteStats = {};
  results.votes.forEach(vote => {
    if (!voteStats[vote.vote]) {
      voteStats[vote.vote] = { value: vote.vote, count: 0, participants: [] };
    }
    voteStats[vote.vote].count++;
    voteStats[vote.vote].participants.push(vote.username);
  });

  // Rendera staplar med procent + individuella röster
  // ...
}
```

### 3e. Ny runda

```js
document.getElementById('new-round-btn').addEventListener('click', () => {
  socketManager.resetRound();
});
```

**Event:** `reset-round` → servern

**Event:** `round-reset` ← servern

```js
socketManager.on('round-reset', (data) => {
  uiManager.resetView();
  // data.roundHistory innehåller alla avslutade rundor
});
```

```js
// ui.js
resetView() {
  document.getElementById('results-area').classList.add('hidden');
  document.getElementById('reveal-controls').classList.add('hidden');
  this.selectedVote = null;
  // Nollställer kort, borttagning av .voted-klasser osv.
}
```

---

## Flöde 4: Skicka meddelanden

### Steg 1: Användaren skriver och skickar

```js
// client.js
document.getElementById('chat-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendChatMessage();
});

document.getElementById('chat-send-btn').addEventListener('click', sendChatMessage);

function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (!message) return;

  socketManager.sendMessage(message);
  input.value = '';
}
```

### Steg 2: SocketManager skickar till servern

**Event:** `send-message` → servern

```js
// socket.js
sendMessage(message) {
  this.socket.emit('send-message', { message });
}
```

### Steg 3: Alla i sessionen tar emot meddelandet

**Event:** `chat-message` ← servern

```js
socketManager.on('chat-message', (chatMessage) => {
  uiManager.addChatMessage(chatMessage);
});
```

```js
// ui.js
addChatMessage(chatMessage) {
  const chatMessages = document.getElementById('chat-messages');

  const time = new Date(chatMessage.timestamp).toLocaleTimeString('sv-SE', {
    hour: '2-digit', minute: '2-digit'
  });

  const messageEl = document.createElement('div');
  messageEl.className = 'chat-message';
  messageEl.innerHTML = `
    <div class="chat-message-header">
      <span class="chat-username">${chatMessage.username}</span>
      <span class="chat-time">${time}</span>
    </div>
    <div class="chat-message-text">${chatMessage.message}</div>
  `;

  chatMessages.appendChild(messageEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;  // Auto-scroll
}
```

> Nya deltagare som ansluter får hela chatthistoriken via `chat-history`-eventet.

---

## Event-referens

### Klient → Server

| Event | Data | Beskrivning |
|---|---|---|
| `join-session` | `{ username, theme?, sessionId?, create }` | Skapa/gå med |
| `start-voting` | `{ timerDuration }` | Starta runda |
| `submit-vote` | `{ vote }` | Skicka röst |
| `reveal-votes` | *(inget)* | Avslöja röster |
| `reset-round` | *(inget)* | Ny runda |
| `send-message` | `{ message }` | Chattmeddelande |
| `kick-user` | `{ userId }` | Sparka deltagare |
| `end-session` | *(inget)* | Avsluta session |

### Server → Klient

| Event | Data | Beskrivning |
|---|---|---|
| `participants-updated` | `[{ id, username, isCreator }]` | Deltagarlista |
| `theme-changed` | `"modern"` / `"flat"` / `"retro"` | Tema |
| `voting-started` | `{ timerDuration, timerStartedAt, roundNumber }` | Voting igång |
| `user-voted` | `{ userId }` | Någon har röstat (hemligt) |
| `votes-revealed` | `{ votes: [{ userId, username, vote }] }` | Alla röster visas |
| `round-reset` | `{ roundHistory }` | Runda avslutad |
| `chat-message` | `{ id, userId, username, message, timestamp }` | Nytt meddelande |
| `chat-history` | `[...chatMessages]` | Historik (vid join) |
| `kicked` | *(inget)* | Du sparkades |
| `session-ended` | *(inget)* | Sessionen avslutad |
