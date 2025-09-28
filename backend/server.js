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

const MONGO = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/vidyavichar';
await mongoose.connect(MONGO);

// HTTP + Socket.IO (optional)
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, credentials: true }
});

// Broadcast helper
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
  console.log(`Server running on port ${PORT}`);
});