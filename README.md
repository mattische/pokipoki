# pokipoki

Poker planning app in node.
Provided docker compose uses settings in .env file (port).

## Get up and running

### install
```bash
npm install
```

### run app
```bash
npm start
# http://localhost:<port setting in .env>
# invite users by sending session id to them
```

### docker compose
```bash
# default port as specified in .env
docker compose up

# if you want to change port (e.g., 8080)
APP_PORT=8080 docker compose up
```

### docker manual
```bash
docker build -t pokipoki .

# Run and auto-remove container when stopped, exposing port 3000 on local network
docker run --rm -p 3000:3000 pokipoki
```

## features
- run poker planning sessions with team, in browser
- 3 themes
- timer
- chat

## arch

### backend
- `server.js` - express server with socket.io
- `src/auth.js` - JWT auth
- `src/sessionManager.js` - sessions
- `src/socketHandler.js` - event handling for socket

### frontend
- `public/index.html` - html
- `public/*.css` - style sheet with themes
- `public/js/client.js` - client js
- `public/js/socket.js` - socket logic
- `public/js/ui.js` - ui scripts
- `public/js/themeManager.js` - theme management

## env variables

- `PORT` - server port (default: 3000)
- `NODE_ENV` - environment (development/production)
- `JWT_SECRET` - secret key for JWT (change in production!)

## dev mode

```bash
# dev mode with watch
npm run dev

# dev with Docker
docker-compose --profile dev up
```
