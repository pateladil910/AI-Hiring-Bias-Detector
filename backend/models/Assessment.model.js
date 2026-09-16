// MongoDB Model: Assessments — Real scoring, NO hardcoded defaults
const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  answer: { type: Number, default: null }, // index of selected option, null = unanswered
  savedAt: { type: Date, default: Date.now }
}, { _id: false });

const TestResultSchema = new mongoose.Schema({
  testId: { type: String },
  description: { type: String },
  passed: { type: Boolean },
  actualOutput: { type: String },
  expectedOutput: { type: String },
  executionMs: { type: Number }
}, { _id: false });

const CodingSubmissionSchema = new mongoose.Schema({
  code: { type: String },
  language: { type: String, default: 'javascript' },
  testsPassed: { type: Number, default: 0 },
  testsTotal: { type: Number, default: 0 },
  testResults: [TestResultSchema],
  executionMs: { type: Number, default: 0 },
  submittedAt: { type: Date }
}, { _id: false });

const AssessmentSchema = new mongoose.Schema({
  candidateRef: {
    type: String,
    required: [true, 'Candidate reference is required'],
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  domainId: {
    type: String,
    required: [true, 'Domain ID is required']
  },
  rubricVersion: {
    type: String,
    default: '1.0'
  },
  questionSetVersion: {
    type: String,
    default: '1.0'
  },
  status: {
    type: String,
    enum: [
      'not_started',
      'in_progress',
      'submitted',
      'evaluation_pending',
      'complete',
      'recruiter_review_pending',
      'review_completed'
    ],
    default: 'not_started'
  },
  // Answers stored per question (no answer key stored here)
  mcqAnswers: [AnswerSchema],
  aptitudeAnswers: [AnswerSchema],
  codingSubmission: CodingSubmissionSchema,

  // Scores: null until evaluated — NEVER default to fake numbers
  mcqScore: { type: Number, default: null },
  aptitudeScore: { type: Number, default: null },
  codingScore: { type: Number, default: null },
  resumeMatchScore: { type: Number, default: null },
  compositeScore: { type: Number, default: null },

  // Transparent scoring formula shown to candidate
  scoringFormula: {
    type: String,
    default: 'Composite = (MCQ × 0.4) + (Coding × 0.4) + (ResumeMatch × 0.2)'
  },
  scoringExplanation: { type: String, default: null },

  // Neutral status label — NEVER 'STRONG FIT' or 'RECOMMENDED'
  statusLabel: {
    type: String,
    default: 'Assessment not yet started'
  },

  startedAt: { type: Date, default: null },
  submittedAt: { type: Date, default: null },
  evaluatedAt: { type: Date, default: null }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

// Never expose userId in public queries — remove from JSON when needed
AssessmentSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Assessment', AssessmentSchema);
