/**
 * Seed Script — Creates demo accounts for the EquiHire AI platform.
 * Run: node seed.js
 *
 * Creates:
 *   Admin:     admin@equihire.demo   / Admin@12345!
 *   Recruiter: recruiter@equihire.demo / Recruit@12345!
 *
 * NOTE: Only run this in development/demo. Never use these credentials in production.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('./models/user.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/equihire_ai_db';

const DEMO_ACCOUNTS = [
  {
    name:     'EquiHire Admin',
    email:    'admin@equihire.demo',
    password: 'Admin@12345!',
    role:     'admin'
  },
  {
    name:     'Sarah Recruiter',
    email:    'recruiter@equihire.demo',
    password: 'Recruit@12345!',
    role:     'recruiter'
  },
  {
    name:     'Demo Candidate',
    email:    'candidate@equihire.demo',
    password: 'Candidate@12345!',
    role:     'candidate'
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('\n[Seed] Connected to MongoDB:', MONGO_URI);
    console.log('[Seed] Creating demo accounts...\n');

    for (const account of DEMO_ACCOUNTS) {
      const existing = await User.findOne({ email: account.email });
      if (existing) {
        console.log(`  ⚠️  Already exists: ${account.email} (${account.role})`);
        continue;
      }

      const passwordHash = await bcrypt.hash(account.password, 12);
      await User.create({
        name:         account.name,
        email:        account.email,
        passwordHash,
        role:         account.role,
        isActive:     true
      });

      console.log(`  ✅ Created ${account.role}: ${account.email} / ${account.password}`);
    }

    console.log('\n[Seed] ─────────────────────────────────────────────');
    console.log('[Seed] Demo credentials:');
    console.log('');
    console.log('  Admin:     admin@equihire.demo     / Admin@12345!');
    console.log('  Recruiter: recruiter@equihire.demo / Recruit@12345!');
    console.log('  Candidate: candidate@equihire.demo / Candidate@12345!');
    console.log('');
    console.log('[Seed] Open: http://localhost:5000');
    console.log('[Seed] ─────────────────────────────────────────────\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n[Seed] ERROR:', err.message);
    process.exit(1);
  }
}

seed();
