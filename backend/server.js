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

// CORS (frontend vite default: 5173)
app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
app.use(express.json());

// DB
mongoose.connect('mongodb://127.0.0.1:27017/vidyavichar')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/questions', questionRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// 🔌 Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ['http://localhost:5173'], methods: ['GET','POST','PATCH','DELETE'], credentials: true },
  transports: ['websocket'],
});

// Optional: protect handshake with JWT
// import jwt from 'jsonwebtoken';
// const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// io.use((socket, next) => {
//   const token = socket.handshake.auth?.token;
//   if (!token) return next(new Error('no token'));
//   try {
//     socket.data.user = jwt.verify(token, JWT_SECRET); // { id, role }
//     next();
//   } catch {
//     next(new Error('invalid token'));
//   }
// });

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('join-course', (courseId) => {
    if (!courseId) return;
    socket.join(`course:${courseId}`);
  });

  socket.on('join-session', (sessionId) => {
    if (!sessionId) return;
    socket.join(`session:${sessionId}`);
  });

  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id);
  });
});

// Make io available inside routes via req.app.get('io')
app.set('io', io);

const PORT = 5000;
server.listen(PORT, () => console.log(`HTTP + Socket.IO on :${PORT}`));




// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import mongoose from 'mongoose';
// import authRoutes from './routes/auth.js';
// import courseRoutes from './routes/courses.js'; // ← Add this import
// import sessionRoutes from './routes/sessions.js'; // ← Add this if you created sessions
// import questionRoutes from './routes/questions.js'; // ← Add this if you have questions routes

// dotenv.config();
// const app = express();

// app.use(cors());
// app.use(express.json());

// // MongoDB connection
// mongoose.connect('mongodb://127.0.0.1:27017/vidyavichar')
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error('MongoDB connection error:', err));

// // Test DB connection route
// app.get('/api/test-db', async (req, res) => {
//   try {
//     const collections = await mongoose.connection.db.listCollections().toArray();
//     res.json({ 
//       status: 'MongoDB connected successfully!',
//       database: mongoose.connection.db.databaseName,
//       collections: collections.map(c => c.name)
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'MongoDB connection failed', details: error.message });
//   }
// });

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/courses', courseRoutes); // ← Add this line
// app.use('/api/sessions', sessionRoutes); // ← Add if you have sessions
// app.use('/api/questions', questionRoutes); // ← Add if you have questions routes

// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK', message: 'Backend is running!' });
// });

// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });