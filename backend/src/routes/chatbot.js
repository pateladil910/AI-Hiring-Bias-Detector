const express = require('express');
const axios = require('axios');
const { ChatbotSession, User } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// ─── POST /api/chatbot/session ────────────────────────────────────────────────
// Get or create an active chat session for the logged-in user
router.post('/session', authenticate, async (req, res) => {
  try {
    const role = ['recruiter', 'hr_lead', 'admin', 'compliance'].includes(req.user.role)
      ? 'recruiter'
      : 'candidate';

    // Find the most recently updated session, or create a fresh one
    let session = await ChatbotSession.findOne({
      where: { userId: req.user.id },
      order: [['updatedAt', 'DESC']],
    });

    if (!session) {
      session = await ChatbotSession.create({
        userId: req.user.id,
        role,
        messagesJson: [],
      });
    }

    return res.status(200).json({
      session: {
        id: session.id,
        role: session.role,
        messages: session.messagesJson || [],
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    });
  } catch (err) {
    console.error('[CHATBOT SESSION ERROR]', err.message);
    return res.status(500).json({ error: { code: 'SESSION_FAILED', message: 'Failed to initialize chat session' } });
  }
});

// ─── POST /api/chatbot/session/new ────────────────────────────────────────────
// Explicitly start a fresh clean chat session
router.post('/session/new', authenticate, async (req, res) => {
  try {
    const role = ['recruiter', 'hr_lead', 'admin', 'compliance'].includes(req.user.role)
      ? 'recruiter'
      : 'candidate';

    const session = await ChatbotSession.create({
      userId: req.user.id,
      role,
      messagesJson: [],
    });

    return res.status(201).json({
      session: {
        id: session.id,
        role: session.role,
        messages: session.messagesJson || [],
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    });
  } catch (err) {
    console.error('[CHATBOT NEW SESSION ERROR]', err.message);
    return res.status(500).json({ error: { code: 'NEW_SESSION_FAILED', message: 'Failed to create new chat session' } });
  }
});

// ─── GET /api/chatbot/session/:id ─────────────────────────────────────────────
// Fetch conversation history for a specific session
router.get('/session/:id', authenticate, async (req, res) => {
  try {
    const session = await ChatbotSession.findByPk(req.params.id);

    if (!session) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Chat session not found' } });
    }

    if (session.userId !== req.user.id && !['admin', 'compliance'].includes(req.user.role)) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    return res.json({
      session: {
        id: session.id,
        role: session.role,
        messages: session.messagesJson || [],
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    });
  } catch (err) {
    console.error('[CHATBOT GET SESSION ERROR]', err.message);
    return res.status(500).json({ error: { code: 'FETCH_FAILED', message: 'Failed to fetch session' } });
  }
});

// ─── POST /api/chatbot/session/:id/message ────────────────────────────────────
// Send a user message and receive an AI assistant response
router.post('/session/:id/message', authenticate, async (req, res) => {
  const { message, context } = req.body;

  if (!message || !message.trim()) {
    return res.status(422).json({ error: { code: 'MISSING_MESSAGE', message: 'message string is required' } });
  }

  try {
    const session = await ChatbotSession.findByPk(req.params.id);

    if (!session) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Chat session not found' } });
    }

    if (session.userId !== req.user.id && !['admin', 'compliance'].includes(req.user.role)) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    const currentMessages = Array.isArray(session.messagesJson) ? session.messagesJson : [];

    // Format conversation history for AI service
    const conversationHistory = currentMessages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));

    // Call AI Microservice
    let aiResponse;
    try {
      const aiRes = await axios.post(
        `${AI_SERVICE_URL}/chatbot/message`,
        {
          role: session.role,
          message: message.trim(),
          conversation_history: conversationHistory,
          context: context || { userRole: req.user.role, userName: req.user.firstName },
        },
        { timeout: 20000 }
      );
      aiResponse = aiRes.data;
    } catch (aiErr) {
      console.error('[CHATBOT AI ERROR]', aiErr.message);
      aiResponse = {
        reply: "I apologize, but I'm currently having trouble connecting to the AI brain. Please try again in a moment.",
        suggestions: ["How does blind screening work?", "How are aptitude tests scored?"],
        model_version: "fallback-error",
      };
    }

    const now = new Date().toISOString();
    const userMsgObj = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: message.trim(),
      timestamp: now,
    };

    const assistantMsgObj = {
      id: `msg_a_${Date.now() + 1}`,
      role: 'assistant',
      content: aiResponse.reply,
      suggestions: aiResponse.suggestions || [],
      modelVersion: aiResponse.model_version,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...currentMessages, userMsgObj, assistantMsgObj];

    session.messagesJson = updatedMessages;
    session.changed('messagesJson', true);
    await session.save();

    return res.status(200).json({
      userMessage: userMsgObj,
      assistantMessage: assistantMsgObj,
      sessionId: session.id,
    });
  } catch (err) {
    console.error('[CHATBOT SEND MESSAGE ERROR]', err.message);
    return res.status(500).json({ error: { code: 'SEND_FAILED', message: 'Failed to send chat message' } });
  }
});

// ─── DELETE /api/chatbot/session/:id ──────────────────────────────────────────
// Reset / clear a chat session
router.delete('/session/:id', authenticate, async (req, res) => {
  try {
    const session = await ChatbotSession.findByPk(req.params.id);

    if (!session) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Session not found' } });
    }

    if (session.userId !== req.user.id && !['admin', 'compliance'].includes(req.user.role)) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    session.messagesJson = [];
    session.changed('messagesJson', true);
    await session.save();

    return res.json({ message: 'Session cleared successfully', session: { id: session.id, messages: [] } });
  } catch (err) {
    console.error('[CHATBOT CLEAR ERROR]', err.message);
    return res.status(500).json({ error: { code: 'CLEAR_FAILED', message: 'Failed to clear session' } });
  }
});

module.exports = router;
