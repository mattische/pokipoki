# Poker Planning Web App

A modern poker planning application built with Node.js, WebSockets, JWT, timer functionality, and real-time updates.

## Quick Start

### Installation
```bash
npm install
```

### Run Application
```bash
npm start
# Open http://localhost:3000
```

### docker compose
```bash
# Run with default port 3000
docker compose up

# Run on a different port (e.g., 8080)
APP_PORT=8080 docker compose up
```

### docker manual
```bash
docker build -t pokipoki .

# Run and auto-remove container when stopped
docker run --rm -p 3000:3000 pokipoki
```

## Features
- Run poker planning sessions with team
- 3 different themes
- Swedish and English language support
- Timer functionality
- Real-time updates
- JWT authentication
- Chat functionality

## Architecture

### Backend
- `server.js` - Express server with Socket.IO
- `src/auth.js` - JWT authentication
- `src/sessionManager.js` - Session management
- `src/socketHandler.js` - WebSocket event handling

### Frontend
- `public/index.html` - HTML structure
- `public/styles.css` - Design system
- `public/js/client.js` - Main client module
- `public/js/socket.js` - WebSocket communication
- `public/js/ui.js` - UI management
- `public/js/themeManager.js` - Theme management

## Tech Stack

- **Backend**: node.js, express, socket.io
- **Frontend**: javascript (es modules), html5, css3
- **Auth**: JWT (jsonwebtoken)
- **Containerization**: Docker, Docker Compose

## Usage

1. **Create Session**: Enter your name and click "Create New Session"
2. **Share ID**: Others can join using the session ID
3. **Start Voting**: Set timer and start the round
4. **Choose Card**: All participants choose their card
5. **Results**: Cards are revealed automatically when timer ends or manually by host
6. **New Round**: Host clicks "new voting" to start the next story

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - Secret key for JWT (change in production!)

## Development

```bash
# Development mode with watch
npm run dev

# Development with Docker
docker-compose --profile dev up
```

## License

MIT
