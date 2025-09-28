// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import sessionRoutes from './routes/sessions.js';
import questionRoutes from './routes/questions.js';

dotenv.config();
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ---- MongoDB connection ----
const MONGO =
  process.env.MONGODB_URI ||
  process.env.MONGO_URL ||
  'mongodb://127.0.0.1:27017/vidyavichar';

try {
  await mongoose.connect(MONGO, {
    // If your URI already has the db in its path, this is harmless.
    dbName: process.env.MONGO_DB || 'vidyavichar',
  });
  console.log('✅ MongoDB connected:', mongoose.connection.host);
} catch (err) {
  console.error('❌ MongoDB connection error:', err?.message);
  process.exit(1);
}

// Optional: tiny DB health route
app.get('/api/health/db', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting', 'unauthorized', 'unknown'];
  res.json({
    state: states[mongoose.connection.readyState] || 'unknown',
    host: mongoose.connection.host,
    name: mongoose.connection.name,
  });
});

// HTTP + Socket.IO (optional)
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true, credentials: true } });
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/questions', questionRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Optional: better crash diagnostics
process.on('unhandledRejection', (err) => {
  console.error('UnhandledRejection:', err);
});
process.on('uncaughtException', (err) => {
  console.error('UncaughtException:', err);
});
