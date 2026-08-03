const { WebSocketServer } = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocketServer({ server, path: '/live' });
wss.on('connection', () => console.log('connected!'));
server.listen(3001, () => {
  const ws = new (require('ws'))('ws://localhost:3001/live?query=1');
  ws.on('open', () => {
    console.log('client open');
    process.exit(0);
  });
  ws.on('error', (e) => {
    console.error('client error', e);
    process.exit(1);
  });
});
