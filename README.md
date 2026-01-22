# pokipoki

Poker planning app in node.


[@mattische](https://github.com/mattische)

[Docker Hub](https://hub.docker.com/repository/docker/mattische/pokipoki/general)

## Get up and running

### install
```bash
npm install
```

### run app
```bash
# http://localhost:<port setting in .env>
# first user is host - invite users by sending session id to them

npm start
```

## docker

_provided docker compose uses settings in .env file (port)._

### docker compose
```bash
# default port as specified in .env
docker compose up

# if you want to change port (e.g., 8080)
APP_PORT=8080 docker compose up
```

### docker
```bash
# this creates a docker image from the current directory and tag it as pokipoki
# it shows up in docker images list as pokipoki in docker desktop
docker build -t pokipoki .

# Run and auto-remove container when stopped, exposing port 3000 on local network
docker run --rm -p 3000:3000 pokipoki
```

## features
- run poker planning sessions with team, in browser
- 3 themes
- timer
- chat
- first participant will be host and a session id is created; share id with others to invite them
  

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
- `JWT_SECRET` - secret key for JWT (use your own)

Generete JWT token with. 
```bash
openssl rand base64 32
```

## dev mode

```bash
# dev mode with watch
npm run dev

# dev with Docker
docker-compose --profile dev up
```
