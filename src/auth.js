/**
 * JWT Autentiseringsmodul
 * Hanterar generering och validering av JWT tokens för användare
 */

import jwt from 'jsonwebtoken';

// Secret key - i produktion ska denna vara i miljövariabel
const JWT_SECRET = process.env.JWT_SECRET || 'poker-planning-secret-key-change-in-production';

/**
 * Genererar en JWT token för en användare
 * @param {Object} payload - Data att inkludera i token (userId, sessionId, username)
 * @returns {string} JWT token
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h' // Token giltig i 24 timmar
  });
}

/**
 * Validerar och dekoderar en JWT token
 * @param {string} token - JWT token att validera
 * @returns {Object|null} Dekodad payload eller null om ogiltig
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token validation failed:', error.message);
    return null;
  }
}

/**
 * Extraherar token från Socket.IO handshake
 * @param {Object} socket - Socket.IO socket objekt
 * @returns {string|null} Token eller null
 */
export function extractTokenFromSocket(socket) {
  // Token kan komma från auth object eller query parameter
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  return token || null;
}
