// MongoDB Model: Anonymized Candidate Profiles
const mongoose = require('mongoose');
const crypto = require('crypto');

const CandidateSchema = new mongoose.Schema({
  // Links to user account — RESTRICTED, not returned in recruiter queries
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Random, non-sequential reference ID used in all public/recruiter-facing queries
  refId: {
    type: String,
    required: true,
    unique: true,
    default: () => 'CAND-' + crypto.randomBytes(3).toString('hex').toUpperCase()
  },

  // Pseudonymous display name derived from refId — never the real name
  cloakedName: {
    type: String,
    default: function () {
      return 'Candidate ' + this.refId;
    }
  },

  // Extracted skills from resume (after redaction)
  skills: [{ type: String, trim: true }],

  // Which identity markers were detected and redacted
  redactedMarkers: [{
    type: String,
    enum: ['name', 'email', 'phone', 'address', 'photo', 'gender_pronoun', 'age_indicator', 'institution_ref', 'other']
  }],

  // Parsed years of experience
  parsedExperienceYears: {
    type: Number,
    default: null
  },

  // Redacted resume text shown to recruiters — no identity data
  resumeTextRedacted: { type: String, default: null },

  // File reference for original resume — restricted access, separate from evaluator-facing data
  resumeFileRef: { type: String, default: null },

  // Parsing and redaction tracking
  parseStatus: {
    type: String,
    enum: ['pending', 'extracted', 'redacted', 'reviewed', 'error'],
    default: 'pending'
  },
  redactionVersion: { type: String, default: '1.0' },
  redactionReviewStatus: {
    type: String,
    enum: ['pending_review', 'confirmed', 'corrected'],
    default: 'pending_review'
  },
  extractionNotes: { type: String, default: null }, // any warnings about extraction quality

  // Consent tracking
  consentTimestamp: { type: Date, default: null },

  // Data retention
  retentionStatus: {
    type: String,
    enum: ['active', 'deletion_requested', 'deleted'],
    default: 'active'
  },

  uploadedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Strip userId and resumeFileRef when serializing for recruiter-facing queries
CandidateSchema.methods.toRecruiterView = function () {
  const obj = this.toObject();
  delete obj.userId;
  delete obj.resumeFileRef;
  delete obj.resumeTextRedacted; // full text not needed in list view
  delete obj.__v;
  return obj;
};

CandidateSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Candidate', CandidateSchema);
