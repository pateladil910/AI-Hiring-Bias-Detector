const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { attachWebSocketServer } = require('./websocket/biasScoreWS');

// ─── Route Imports ────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const employersRoutes = require('./routes/employers');
const adminRoutes = require('./routes/admin');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const testsRoutes = require('./routes/tests');
const eligibilityRoutes = require('./routes/eligibility');
const chatbotRoutes = require('./routes/chatbot');
const auditRoutes = require('./routes/audit');
const analyticsRoutes = require('./routes/analytics');
const biasRoutes = require('./routes/bias');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'hiring-bias-backend', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/employers', employersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/bias', biasRoutes);

// Serve uploaded resumes (so frontend can link to them)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred',
    },
  });
});

// ─── Startup ──────────────────────────────────────────────────────────────────
const start = async () => {
  try {
    await connectDB();

    // Ensure default admin exists for system administration & testing
    const { User } = require('./models');
    const bcrypt = require('bcryptjs');
    const adminExists = await User.findOne({ where: { email: 'admin@fairhire.io' } });
    if (!adminExists) {
      const passwordHash = await bcrypt.hash('password123', 12);
      await User.create({
        email: 'admin@fairhire.io',
        passwordHash,
        firstName: 'System',
        lastName: 'Admin',
        role: 'admin',
        emailVerified: true,
        isActive: true,
      });
      console.log('👑 Default admin account seeded: admin@fairhire.io');
    }

    // Use http.createServer so WebSocket can share the same port
    const httpServer = http.createServer(app);
    attachWebSocketServer(httpServer);
    httpServer.listen(PORT, () => {
      console.log(`✅ Backend running on http://localhost:${PORT}`);
      console.log(`🔌 WebSocket at ws://localhost:${PORT}/ws/bias-score`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

start();

module.exports = app; // for testing
