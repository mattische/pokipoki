/**
 * jwt authentication module
 * handles token generation and validation
 */

import jwt from 'jsonwebtoken';

// Secret key - create your own in .env
const JWT_SECRET = process.env.JWT_SECRET || 'poker-planning-secret-key-change-in-production';

/**
 * generates jwt token
 * @param {Object} payload - data to include (userId, sessionId, username)
 * @returns {string} JWT token
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h' // token valid for 24 hours
  });
}

/**
 * validates and decodes jwt token
 * @param {string} token - jwt token to validate
 * @returns {Object|null} decoded payload or null if invalid
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
 * extracts token from socket.io handshake
 * @param {Object} socket - socket.io socket object
 * @returns {string|null} token or null
 */
export function extractTokenFromSocket(socket) {
  // token from auth object or query parameter
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  return token || null;
}
