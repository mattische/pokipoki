/**
 * Poker Planning Server
 * Express + Socket.IO server för realtids poker planning
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { setupSocketHandlers } from './src/socketHandler.js';

// ES modules fix för __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = process.env.PORT || 3000;

// Servera statiska filer från public-mappen
app.use(express.static(join(__dirname, 'public')));

// Huvudroute
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Sätt upp WebSocket-hantering
setupSocketHandlers(io);

// Starta servern
httpServer.listen(PORT, () => {
    console.log(`🚀 Poker Planning server running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket server ready`);
});
