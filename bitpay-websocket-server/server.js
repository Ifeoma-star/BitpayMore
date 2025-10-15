/**
 * Standalone WebSocket Server for BitPay
 * Handles real-time blockchain event broadcasting
 */

const { createServer } = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 4000;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'https://localhost:3000'];

// Create HTTP server
const httpServer = createServer((req, res) => {
  // Health check endpoint
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  // Webhook endpoint for triggering broadcasts
  if (req.url === '/broadcast' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        handleBroadcast(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        console.error('Error processing broadcast:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  path: '/socket.io',
  transports: ['websocket', 'polling'],
});

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Join user-specific room based on wallet address
  socket.on('join-user-room', (walletAddress) => {
    if (walletAddress) {
      socket.join(`user:${walletAddress}`);
      console.log(`👤 User ${walletAddress} joined their room`);
    }
  });

  // Join stream-specific room
  socket.on('join-stream-room', (streamId) => {
    if (streamId) {
      socket.join(`stream:${streamId}`);
      console.log(`📊 Client joined stream room: ${streamId}`);
    }
  });

  // Leave stream room
  socket.on('leave-stream-room', (streamId) => {
    if (streamId) {
      socket.leave(`stream:${streamId}`);
      console.log(`📊 Client left stream room: ${streamId}`);
    }
  });

  // Join marketplace room
  socket.on('join-marketplace', () => {
    socket.join('marketplace');
    console.log('🛒 Client joined marketplace room');
  });

  // Join treasury room
  socket.on('join-treasury', () => {
    socket.join('treasury');
    console.log('🏦 Client joined treasury room');
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Broadcast handler for webhook triggers
function handleBroadcast(data) {
  const { type, target, event, payload } = data;

  switch (type) {
    case 'user':
      io.to(`user:${target}`).emit(event, payload);
      console.log(`📤 Broadcast to user ${target}:`, event);
      break;

    case 'stream':
      io.to(`stream:${target}`).emit(event, payload);
      console.log(`📤 Broadcast to stream ${target}:`, event);
      break;

    case 'marketplace':
      io.to('marketplace').emit(event, payload);
      console.log(`📤 Broadcast to marketplace:`, event);
      break;

    case 'treasury':
      io.to('treasury').emit(event, payload);
      console.log(`📤 Broadcast to treasury:`, event);
      break;

    case 'global':
      io.emit(event, payload);
      console.log(`📤 Global broadcast:`, event);
      break;

    default:
      console.warn('Unknown broadcast type:', type);
  }
}

// Start server
httpServer.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════╗
  ║                                            ║
  ║   ⚡ BitPay WebSocket Server Running      ║
  ║                                            ║
  ║   > Port:     ${PORT}                        ║
  ║   > Mode:     ${process.env.NODE_ENV || 'development'}              ║
  ║                                            ║
  ║   📡 Socket.io: Active                     ║
  ║   🔌 Ready for connections                 ║
  ║                                            ║
  ╚════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
