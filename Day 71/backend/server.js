const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const http = require('http');
const { WebSocketServer } = require('ws');



// Load environment variables
dotenv.config();

// DB connection
const connectDB = require('./config/db');
connectDB();

// Route imports
const userRoutes = require('./routes/userRoutes');
const movieRoutes = require('./routes/movieRoutes');
const showRoutes = require('./routes/ShowRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const { updateMovie } = require('./controllers/movieController');
const { cancelBooking,createBooking } = require('./controllers/bookingController');
const reviewRoutes = require('./routes/reviewRoutes');

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/bookings',bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ticket', ticketRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.put('/:id', updateMovie); // update movie

// routes/bookingRoutes.js
app.delete('/:id', cancelBooking); // cancel booking

app.post('/bookings', createBooking); // create new booking


// Setup Socket.io server

// Create HTTP and WebSocket servers
const server = http.createServer(app);
const wss = new WebSocketServer({
  server,
  perMessageDeflate: false,
  maxPayload: 16 * 1024 // 16KB
});

// Seat tracking data structures
const seatBlocks = {}; // { showId: Set(seatId) }
const userConnections = new Map(); // Map<ws, { clientId, connectedAt }>

// WebSocket logic
wss.on('connection', (ws) => {
  const clientId = generateClientId();
  userConnections.set(ws, { clientId, connectedAt: new Date() });

  console.log(`WebSocket connected - Client ID: ${clientId}`);
  console.log(`Total connections: ${wss.clients.size}`);

  ws.send(JSON.stringify({
    type: 'CONNECTION_CONFIRMED',
    clientId,
    timestamp: new Date().toISOString()
  }));

  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message);
      const { type, showId, seatId } = msg;

      if (!showId || !seatId) {
        console.error('Invalid message format - missing showId or seatId');
        return;
      }

      if (!seatBlocks[showId]) {
        seatBlocks[showId] = new Set();
      }

      if (type === 'BLOCK_SEAT') {
        seatBlocks[showId].add(seatId);
        console.log(`Seat ${seatId} blocked for show ${showId}`);
        broadcast(wss, {
          type: 'SEAT_BLOCKED',
          showId,
          seatId,
          timestamp: new Date().toISOString()
        });
      } else if (type === 'UNBLOCK_SEAT') {
        seatBlocks[showId].delete(seatId);
        console.log(`Seat ${seatId} unblocked for show ${showId}`);
        broadcast(wss, {
          type: 'SEAT_UNBLOCKED',
          showId,
          seatId,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('WebSocket message error:', err);
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Invalid message format',
        timestamp: new Date().toISOString()
      }));
    }
  });

  ws.on('close', () => {
    console.log(`WebSocket disconnected - Client ID: ${clientId}`);
    userConnections.delete(ws);
  });
});

// Broadcast function to all connected clients
function broadcast(wss, message) {
  const data = JSON.stringify(message);
  console.log(`Broadcasting to ${wss.clients.size} clients:`, message);

  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      try {
        client.send(data);
      } catch (err) {
        console.error('Error sending message:', err);
      }
    }
  });
}

// Generate a unique client ID
function generateClientId() {
  return Math.random().toString(36).substr(2, 9);
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  wss.clients.forEach((ws) => {
    ws.close(1000, 'Server shutting down');
  });
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start the server
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
