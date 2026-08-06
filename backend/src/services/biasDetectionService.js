const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Call the AI service to get full bias analysis for a JD.
 * Used on explicit "Analyze" button click.
 */
const analyzeJD = async (jdId, text) => {
  try {
    const { data } = await axios.post(
      `${AI_SERVICE_URL}/analyze/jd`,
      { jd_id: jdId, text },
      { timeout: 10000 }
    );
    return data;
  } catch (err) {
    console.error('[BIAS SERVICE] analyzeJD failed:', err.message);
    // Graceful degradation — route to scan_pending, never crash
    return {
      score: null,
      flags: [],
      flag_count: 0,
      explanation: 'Bias scan temporarily unavailable. Please try again.',
      skill_profile: null,
      model_version: 'unavailable',
      error: true,
    };
  }
};

/**
 * Call the AI service for a quick score (live typing).
 * Lightweight — returns only score + flag_count.
 */
const quickScore = async (text) => {
  try {
    const { data } = await axios.post(
      `${AI_SERVICE_URL}/analyze/jd/quick`,
      { text },
      { timeout: 5000 }
    );
    return data;
  } catch (err) {
    // Don't log every keystroke failure — just return null
    return null;
  }
};

module.exports = { analyzeJD, quickScore };
