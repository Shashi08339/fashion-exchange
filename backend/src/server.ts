// backend/src/server.ts
import dotenv from 'dotenv';
import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { configureCloudinary } from './config/cloudinary';
import { Server as SocketServer } from 'socket.io';

dotenv.config();

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

// Initialize real-time global orchestration layer
const io = new SocketServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  },
  pingTimeout: 60000,
  allowEIO3: true
});

// Inject socket instance globally to access via req.app.get('io')
app.set('io', io);

// Basic socket authentication stub to build on cleanly later
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers['authorization'];
  // Execution contexts downstream can securely populate details from this
  next();
});

io.on('connection', (socket) => {
  console.log(`[RealTime] Socket Client Connected: ${socket.id}`);
  
  socket.on('join_user_room', (userId: string) => {
    socket.join(userId);
    console.log(`[RealTime] Socket Client ${socket.id} joined personal routing room: ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[RealTime] Socket Client Disconnected: ${socket.id}`);
  });
});

// Boot sequences
const initSystem = async () => {
  await connectDB();
  configureCloudinary();
  
  server.listen(PORT, () => {
    console.log(`[Runtime Engine] System active on production port ${PORT} under node architecture.`);
  });
};

initSystem().catch((err) => {
  console.error('[Critical System Fault] System engine boot execution aborted:', err);
  process.exit(1);
});