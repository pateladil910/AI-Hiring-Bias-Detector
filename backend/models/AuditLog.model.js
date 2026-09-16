// MongoDB Model: Real Audit Event Logging — NO fake defaults
const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  // Category of audit check (PDF §10)
  eventType: {
    type: String,
    enum: [
      'redaction_coverage',      // What was detected/redacted, known limitations
      'resume_readability',      // Skills remain understandable after redaction
      'question_language',       // Question set version, flagged wording
      'assessment_consistency',  // Rubric version, time rules, accommodations
      'access_control',          // Identity reveal, privileged access events
      'result_traceability',     // Inputs, formula, score, timestamps
      'outcome_monitoring',      // Aggregate analysis (admin only)
      'login',                   // Sign-in event
      'logout',                  // Sign-out event
      'upload',                  // Resume upload event
      'submission',              // Assessment submission
      'review',                  // Recruiter review recorded
      'identity_reveal',         // Authorized identity reveal
      'admin_action',            // Admin-performed action
      'unauthorized_attempt'     // Blocked unauthorized access
    ],
    required: [true, 'Event type is required']
  },

  // Who performed the action
  actorRole: {
    type: String,
    enum: ['candidate', 'recruiter', 'admin', 'system'],
    required: true
  },
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // What was affected
  targetRecord: {
    type: String, // candidateRef or assessmentId
    default: null
  },

  // What happened and the result
  action: {
    type: String,
    required: [true, 'Action description is required']
  },
  result: {
    type: String, // 'passed', 'failed', 'flagged', 'recorded', 'denied', 'completed'
    default: 'recorded'
  },

  // Version tracking for reproducibility
  rubricVersion: { type: String, default: null },
  questionSetVersion: { type: String, default: null },

  // Additional structured context (no PII, no raw resume text)
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// NOTE: NEVER log raw resume text, passwords, or unnecessary PII in audit events.
// metadata should only contain: field names, counts, status values, versions.

AuditLogSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
