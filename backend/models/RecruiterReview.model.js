const mongoose = require('mongoose');

const recruiterReviewSchema = new mongoose.Schema({
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  candidateRef: { type: String, required: true },
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
  jobId: { type: String },
  domainId: { type: String },
  outcome: { 
    type: String, 
    enum: ['advance', 'hold', 'decline', 'review_complete'], 
    required: true 
  },
  reason: { type: String, required: true },
  identityRevealed: { type: Boolean, default: false },
  reviewedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RecruiterReview', recruiterReviewSchema);
