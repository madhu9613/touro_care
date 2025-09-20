'use strict';
const WebSocket = require('ws');
const logger = require('../utils/logger');

let wss;

function startWsServer(port = process.env.WS_PORT || 5001) {
  wss = new WebSocket.Server({ port });
  wss.on('connection', ws => {
    logger.info('WS client connected');
    ws.on('close', () => logger.info('WS client disconnected'));
  });
  logger.info(`WebSocket server running on port ${port}`);
}

function broadcast(topic, payload) {
  if (!wss) return;
  const msg = JSON.stringify({ topic, payload });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  });
}

module.exports = { startWsServer, broadcast };
