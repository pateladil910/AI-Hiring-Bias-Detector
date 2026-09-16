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

// ─── Root & Health Check ──────────────────────────────────────────────────────
app.get('/', (req, res) => {
  if (req.accepts('html')) {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FairHire Backend API</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b1512; color: #e1ede7; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem; }
    .card { background: #12211c; border: 1px solid #1e382f; border-radius: 16px; padding: 2.5rem; max-width: 580px; width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .badge { background: #166534; color: #bbf7d0; padding: 4px 12px; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; display: inline-block; margin-bottom: 1rem; }
    h1 { margin: 0 0 0.5rem; color: #fff; font-size: 1.8rem; }
    p { color: #94a3b8; line-height: 1.6; margin: 0.5rem 0 1.5rem; }
    .actions { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .btn { display: inline-block; background: #10b981; color: #022c22; font-weight: 600; text-decoration: none; padding: 10px 20px; border-radius: 8px; transition: all 0.2s; }
    .btn:hover { background: #34d399; transform: translateY(-1px); }
    .btn-outline { background: transparent; color: #a7f3d0; border: 1px solid #059669; }
    .btn-outline:hover { background: #064e3b; }
    .endpoints { border-top: 1px solid #1e382f; padding-top: 1.2rem; font-size: 0.9rem; }
    code { background: #0a1310; padding: 2px 6px; border-radius: 4px; color: #6ee7b7; font-family: monospace; }
    ul { padding-left: 1.2rem; margin: 0.5rem 0 0; color: #94a3b8; }
    li { margin-bottom: 0.4rem; }
    a { color: #34d399; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">● Online & Ready</span>
    <h1>FairHire Backend API</h1>
    <p>The Express REST API and real-time WebSocket service are operational.</p>
    <div class="actions">
      <a class="btn" href="http://localhost:5173" target="_blank">Open Web App (Port 5173) →</a>
      <a class="btn btn-outline" href="/health">View /health Status</a>
    </div>
    <div class="endpoints">
      <div style="color: #6ee7b7; font-weight: 600; margin-bottom: 0.3rem;">Service Information:</div>
      <ul>
        <li>Frontend UI: <a href="http://localhost:5173" target="_blank">http://localhost:5173</a></li>
        <li>Health Endpoint: <a href="/health"><code>/health</code></a></li>
        <li>WebSocket Server: <code>ws://localhost:5000/ws/bias-score</code></li>
        <li>AI Microservice: <a href="http://localhost:8000" target="_blank">http://localhost:8000</a></li>
      </ul>
    </div>
  </div>
</body>
</html>`);
  } else {
    res.json({
      status: 'ok',
      service: 'hiring-bias-backend',
      version: '2.0.0',
      message: 'FairHire AI Backend API is running',
      frontendUrl: 'http://localhost:5173',
      endpoints: {
        health: '/health',
        auth: '/api/auth',
        jobs: '/api/jobs',
        applications: '/api/applications',
        bias: '/api/bias',
        websocket: '/ws/bias-score'
      }
    });
  }
});

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
