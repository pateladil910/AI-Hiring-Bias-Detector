const User = require('../models/user.model');
const AuditLog = require('../models/AuditLog.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    // Check if user exists — use GENERIC error to avoid revealing existing emails
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Registration could not be completed. Please check your details or contact support.' });
    }

    // Hash password (saltRounds = 12 as per PDF security requirements)
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user — forced to candidate role (no self-select of privileged roles)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'candidate'
    });

    // Generate real JWT with 7-day expiry
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'equihire_jwt_secret_dev',
      { expiresIn: '7d' }
    );


    // Audit log for registration
    await AuditLog.create({
      eventType: 'login',
      actorRole: 'candidate',
      actorId: user._id,
      action: 'New candidate account registered',
      result: 'success',
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('[Auth] Register error:', error.message);
    res.status(500).json({ success: false, message: 'Registration could not be completed. Please try again.' });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'equihire_jwt_secret_dev',
      { expiresIn: '7d' }
    );

    // Audit log
    await AuditLog.create({
      eventType: 'login',
      actorRole: user.role,
      actorId: user._id,
      action: 'User login',
      result: 'Success',
      timestamp: new Date()
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.provisionRecruiter = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = new User({
      name,
      email,
      passwordHash,
      role: 'recruiter'
    });

    await user.save();

    await AuditLog.create({
      eventType: 'admin_action',
      actorRole: req.user.role,
      actorId: req.user._id,
      action: 'Provisioned recruiter',
      result: `Recruiter created: ${email}`,
      timestamp: new Date()
    });

    res.status(201).json({ message: 'Recruiter provisioned successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
