import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

let clients = [];

export const notifyKitchen = (type, data) => {
  clients.forEach(client => {
    client.res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
  });
};

router.get('/kitchen-stream', authenticate, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  res.write('data: {"type":"connected"}\n\n');

  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res
  };

  clients.push(newClient);

  req.on('close', () => {
    clients = clients.filter(client => client.id !== clientId);
  });
});

export default router;