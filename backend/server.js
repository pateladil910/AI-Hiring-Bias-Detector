require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// ─── Import Routes ────────────────────────────────────────────────
const authRoutes       = require('./routes/auth.routes');
const resumeRoutes     = require('./routes/resume.routes');
const assessmentRoutes = require('./routes/assessment.routes');
const candidateRoutes  = require('./routes/candidate.routes');
const recruiterRoutes  = require('./routes/recruiter.routes');
const auditRoutes      = require('./routes/audit.routes');
const domainRoutes     = require('./routes/domains.routes');

const app = express();

// ─── Connect MongoDB ──────────────────────────────────────────────
connectDB();

// ─── Ensure uploads directory exists ─────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ─── Security Middleware ──────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // disabled so static HTML pages load scripts correctly
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',  // Allow all origins for local dev
  credentials: true
}));

// ─── Body Parsers ─────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Serve Static Files from project root ─────────────────────────
// All HTML/CSS/JS pages live in the root directory
app.use(express.static(path.join(__dirname, '../')));

// Serve uploaded files (restricted - only raw filenames, no directory listing)
app.use('/uploads', express.static(uploadsDir));

// ─── API Routes ───────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/resume',     resumeRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/candidate',  candidateRoutes);
app.use('/api/recruiter',  recruiterRoutes);
app.use('/api/audit',      auditRoutes);
app.use('/api/domains',    domainRoutes);

// ─── Health Check ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'EquiHire AI Backend API',
    version: '2.4.0',
    timestamp: new Date().toISOString()
  });
});

// ─── SPA Fallback ─────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// ─── Start Server ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n EquiHire AI Server running:`);
  console.log(`  → http://localhost:${PORT}`);
  console.log(`  → http://127.0.0.1:${PORT}\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} busy, trying ${PORT + 1}...`);
    app.listen(PORT + 1, '0.0.0.0', () => {
      console.log(` EquiHire AI Server running on http://localhost:${PORT + 1}`);
    });
  } else {
    console.error('Server error:', err);
  }
});

module.exports = app;
