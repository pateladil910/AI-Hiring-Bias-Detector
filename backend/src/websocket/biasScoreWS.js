const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { quickScore } = require('../services/biasDetectionService');

// Debounce: only process if text hasn't changed in 400ms
const debounceMap = new Map();

/**
 * Attach a WebSocket server to the HTTP server.
 * ws://localhost:5000/ws/bias-score
 *
 * Client sends: { type: "score", text: "..." }
 * Server sends: { type: "score_update", score: 82.5, flag_count: 2 }
 *               { type: "error", message: "..." }
 */
const attachWebSocketServer = (httpServer) => {
  const wss = new WebSocket.Server({ server: httpServer, path: '/ws/bias-score' });

  wss.on('connection', (ws, req) => {
    console.log('[WS] Client connected to bias-score channel');

    // Optional: validate JWT from query param
    // ws://localhost:5000/ws/bias-score?token=xxx
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    if (token) {
      try {
        jwt.verify(token, process.env.JWT_SECRET);
      } catch {
        ws.close(4001, 'Unauthorized');
        return;
      }
    }

    ws.on('message', async (rawData) => {
      let msg;
      try {
        msg = JSON.parse(rawData.toString());
      } catch {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
        return;
      }

      if (msg.type !== 'score' || typeof msg.text !== 'string') return;

      const text = msg.text.trim();

      // Return 100 for very short text without calling AI
      if (text.length < 20) {
        ws.send(JSON.stringify({ type: 'score_update', score: 100, flag_count: 0 }));
        return;
      }

      // Debounce: cancel previous timer for this connection
      if (debounceMap.has(ws)) {
        clearTimeout(debounceMap.get(ws));
      }

      const timer = setTimeout(async () => {
        debounceMap.delete(ws);
        if (ws.readyState !== WebSocket.OPEN) return;

        const result = await quickScore(text);

        if (!result) {
          // AI service unavailable — send a neutral score, don't crash
          ws.send(JSON.stringify({ type: 'score_update', score: null, flag_count: 0, unavailable: true }));
          return;
        }

        ws.send(JSON.stringify({
          type: 'score_update',
          score: result.score,
          flag_count: result.flag_count,
        }));
      }, 400); // 400ms debounce

      debounceMap.set(ws, timer);
    });

    ws.on('close', () => {
      console.log('[WS] Client disconnected');
      if (debounceMap.has(ws)) {
        clearTimeout(debounceMap.get(ws));
        debounceMap.delete(ws);
      }
    });

    ws.on('error', (err) => {
      console.error('[WS] Error:', err.message);
    });
  });

  console.log('✅ WebSocket server attached at /ws/bias-score');
  return wss;
};

module.exports = { attachWebSocketServer };
