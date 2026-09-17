const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// ─── Enums ────────────────────────────────────────────────────────────────────
const USER_ROLES = ['admin', 'hr_lead', 'recruiter', 'compliance', 'candidate'];
const ORG_STATUS = ['pending', 'active', 'suspended'];
const RECRUITER_REQUEST_STATUS = ['pending', 'approved', 'rejected'];
const JOB_STATUS = ['draft', 'published', 'closed'];
const APPLICATION_STATUS = ['applied', 'test_sent', 'test_completed', 'eligible', 'not_eligible', 'needs_review', 'interview', 'rejected', 'hired'];
const VERDICT = ['eligible', 'not_eligible', 'needs_review'];

const AUDIT_ACTIONS = {
  RECRUITER_REQUEST_SUBMITTED: 'RECRUITER_REQUEST_SUBMITTED',
  RECRUITER_REQUEST_APPROVED: 'RECRUITER_REQUEST_APPROVED',
  RECRUITER_REQUEST_REJECTED: 'RECRUITER_REQUEST_REJECTED',
  USER_REGISTERED: 'USER_REGISTERED',
  USER_EMAIL_VERIFIED: 'USER_EMAIL_VERIFIED',
  JOB_CREATED: 'JOB_CREATED',
  JOB_PUBLISHED: 'JOB_PUBLISHED',
  JOB_UPDATED: 'JOB_UPDATED',
  BIAS_SCAN_COMPLETED: 'BIAS_SCAN_COMPLETED',
  BIAS_SUGGESTION_ACCEPTED: 'BIAS_SUGGESTION_ACCEPTED',
  BIAS_FLAG_DISMISSED: 'BIAS_FLAG_DISMISSED',
  RESUME_ANONYMIZED: 'RESUME_ANONYMIZED',
  TEST_GENERATED: 'TEST_GENERATED',
  TEST_SUBMITTED: 'TEST_SUBMITTED',
  ELIGIBILITY_COMPUTED: 'ELIGIBILITY_COMPUTED',
  ELIGIBILITY_OVERRIDDEN: 'ELIGIBILITY_OVERRIDDEN',
  APPLICATION_STATUS_UPDATED: 'APPLICATION_STATUS_UPDATED',
};

// ─── Organisation ─────────────────────────────────────────────────────────────
const Organisation = sequelize.define('Organisation', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  workDomain: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.ENUM(...ORG_STATUS), defaultValue: 'active' },
}, { tableName: 'organisations', timestamps: true });

// ─── Recruiter Access Request ─────────────────────────────────────────────────
const RecruiterRequest = sequelize.define('RecruiterRequest', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyName: { type: DataTypes.STRING, allowNull: false },
  workEmail: { type: DataTypes.STRING, allowNull: false, validate: { isEmail: true } },
  companySize: { type: DataTypes.STRING, defaultValue: '1-50' },
  useCase: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.ENUM(...RECRUITER_REQUEST_STATUS), defaultValue: 'pending' },
  inviteToken: { type: DataTypes.STRING, defaultValue: null },
  tokenExpiresAt: { type: DataTypes.DATE, defaultValue: null },
  reviewedBy: { type: DataTypes.UUID, defaultValue: null },
  decisionNotes: { type: DataTypes.TEXT, defaultValue: null },
}, { tableName: 'recruiter_requests', timestamps: true });

// ─── User ─────────────────────────────────────────────────────────────────────
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM(...USER_ROLES), allowNull: false, defaultValue: 'candidate' },
  emailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  verificationToken: { type: DataTypes.STRING, defaultValue: null },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'users', timestamps: true });

// ─── Job ──────────────────────────────────────────────────────────────────────
const Job = sequelize.define('Job', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  rawText: { type: DataTypes.TEXT, allowNull: false },
  biasScore: { type: DataTypes.FLOAT, defaultValue: null },
  skillProfileJson: { type: DataTypes.JSONB, defaultValue: null },
  status: { type: DataTypes.ENUM(...JOB_STATUS), defaultValue: 'draft' },
}, { tableName: 'jobs', timestamps: true });

// ─── Application ──────────────────────────────────────────────────────────────
const Application = sequelize.define('Application', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  anonymousAlias: { type: DataTypes.STRING, defaultValue: null },
  resumeUrl: { type: DataTypes.STRING, defaultValue: null },
  anonymisedText: { type: DataTypes.TEXT, defaultValue: null },
  resumeBiasScore: { type: DataTypes.FLOAT, defaultValue: null },
  status: { type: DataTypes.ENUM(...APPLICATION_STATUS), defaultValue: 'applied' },
  recruiterNotes: { type: DataTypes.TEXT, defaultValue: null },
}, { tableName: 'applications', timestamps: true });

// ─── Candidate Resume ────────────────────────────────────────────────────────
const CandidateResume = sequelize.define('CandidateResume', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  refId: { type: DataTypes.STRING, allowNull: false, unique: true },
  fileName: { type: DataTypes.STRING, allowNull: true },
  fileSize: { type: DataTypes.INTEGER, defaultValue: 0 },
  redactedText: { type: DataTypes.TEXT, allowNull: true },
  detectedMarkersJson: { type: DataTypes.JSONB, defaultValue: [] },
  extractedSkillsJson: { type: DataTypes.JSONB, defaultValue: [] },
  biasScore: { type: DataTypes.FLOAT, defaultValue: null },
  confirmed: { type: DataTypes.BOOLEAN, defaultValue: false },
  consentTimestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'candidate_resumes', timestamps: true });

// ─── Interview ────────────────────────────────────────────────────────────────
const INTERVIEW_STATUS = ['scheduled', 'confirmed', 'reschedule_requested', 'cancelled', 'completed'];
const Interview = sequelize.define('Interview', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  applicationId: { type: DataTypes.UUID, allowNull: true },
  candidateId: { type: DataTypes.UUID, allowNull: false },
  recruiterId: { type: DataTypes.UUID, allowNull: true },
  scheduledAt: { type: DataTypes.DATE, allowNull: false },
  durationMinutes: { type: DataTypes.INTEGER, defaultValue: 45 },
  meetingLink: { type: DataTypes.STRING, defaultValue: 'https://meet.google.com/equi-hire-interview' },
  interviewType: { type: DataTypes.STRING, defaultValue: 'Technical Round' },
  status: { type: DataTypes.ENUM(...INTERVIEW_STATUS), defaultValue: 'scheduled' },
  notes: { type: DataTypes.TEXT, defaultValue: null },
  rescheduleReason: { type: DataTypes.TEXT, defaultValue: null },
}, { tableName: 'interviews', timestamps: true });

// ─── Notification ─────────────────────────────────────────────────────────────
const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  type: { type: DataTypes.STRING, defaultValue: 'system' },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  read: { type: DataTypes.BOOLEAN, defaultValue: false },
  link: { type: DataTypes.STRING, defaultValue: null },
  metaJson: { type: DataTypes.JSONB, defaultValue: null },
}, { tableName: 'notifications', timestamps: true });

// ─── Aptitude Test ────────────────────────────────────────────────────────────
const AptitudeTest = sequelize.define('AptitudeTest', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  applicationId: { type: DataTypes.UUID, allowNull: true },
  domainId: { type: DataTypes.STRING, defaultValue: 'fullstack' },
  questionsJson: { type: DataTypes.JSONB, allowNull: false },
  generatedFromSkillProfile: { type: DataTypes.JSONB, defaultValue: null },
  timeLimitMinutes: { type: DataTypes.INTEGER, defaultValue: 30 },
  startedAt: { type: DataTypes.DATE, defaultValue: null },
  expiresAt: { type: DataTypes.DATE, defaultValue: null },
  mcqScore: { type: DataTypes.FLOAT, defaultValue: null },
  codingScore: { type: DataTypes.FLOAT, defaultValue: null },
  compositeScore: { type: DataTypes.FLOAT, defaultValue: null },
  scoringFormula: { type: DataTypes.STRING, defaultValue: null },
  scoringExplanation: { type: DataTypes.TEXT, defaultValue: null },
  codingSubmissionJson: { type: DataTypes.JSONB, defaultValue: null },
  status: { type: DataTypes.STRING, defaultValue: 'not_started' },
}, { tableName: 'aptitude_tests', timestamps: true });

// ─── Test Submission ──────────────────────────────────────────────────────────
const TestSubmission = sequelize.define('TestSubmission', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  testId: { type: DataTypes.UUID, allowNull: false },
  answersJson: { type: DataTypes.JSONB, allowNull: false },
  autoScore: { type: DataTypes.FLOAT, defaultValue: null },
  llmConfidence: { type: DataTypes.FLOAT, defaultValue: null },
  breakdown: { type: DataTypes.JSONB, defaultValue: null },
  submittedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'test_submissions', timestamps: true });

// ─── Eligibility Verdict ──────────────────────────────────────────────────────
const EligibilityVerdict = sequelize.define('EligibilityVerdict', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  verdict: { type: DataTypes.ENUM(...VERDICT), allowNull: false },
  explanation: { type: DataTypes.TEXT, allowNull: false },
  scoreDetail: { type: DataTypes.JSONB, defaultValue: null },
  modelVersion: { type: DataTypes.STRING, defaultValue: 'v1.0' },
  overriddenBy: { type: DataTypes.UUID, defaultValue: null },
  overrideReason: { type: DataTypes.TEXT, defaultValue: null },
  overriddenAt: { type: DataTypes.DATE, defaultValue: null },
}, { tableName: 'eligibility_verdicts', timestamps: true });

// ─── Audit Log ────────────────────────────────────────────────────────────────
const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  action: { type: DataTypes.STRING, allowNull: false },
  entityType: { type: DataTypes.STRING, allowNull: false },
  entityId: { type: DataTypes.UUID, allowNull: true },
  reason: { type: DataTypes.TEXT, defaultValue: null },
  meta: { type: DataTypes.JSONB, defaultValue: null },
}, { tableName: 'audit_logs', timestamps: true, updatedAt: false });

// ─── Chatbot Session ──────────────────────────────────────────────────────────
const ChatbotSession = sequelize.define('ChatbotSession', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  role: { type: DataTypes.ENUM('candidate', 'recruiter'), allowNull: false },
  messagesJson: { type: DataTypes.JSONB, defaultValue: [] },
}, { tableName: 'chatbot_sessions', timestamps: true });

// ─── Associations ─────────────────────────────────────────────────────────────
Organisation.hasMany(User, { foreignKey: 'orgId' });
User.belongsTo(Organisation, { foreignKey: 'orgId' });

Organisation.hasMany(Job, { foreignKey: 'orgId' });
Job.belongsTo(Organisation, { foreignKey: 'orgId' });

Organisation.hasMany(RecruiterRequest, { foreignKey: 'orgId' });
RecruiterRequest.belongsTo(Organisation, { foreignKey: 'orgId' });

User.hasMany(Job, { foreignKey: 'createdBy', as: 'CreatedJobs' });
Job.belongsTo(User, { foreignKey: 'createdBy', as: 'Creator' });

Job.hasMany(Application, { foreignKey: 'jobId' });
Application.belongsTo(Job, { foreignKey: 'jobId' });

User.hasMany(Application, { foreignKey: 'candidateId', as: 'Applications' });
Application.belongsTo(User, { foreignKey: 'candidateId', as: 'Candidate' });

Application.hasOne(AptitudeTest, { foreignKey: 'applicationId' });
AptitudeTest.belongsTo(Application, { foreignKey: 'applicationId' });

AptitudeTest.hasOne(TestSubmission, { foreignKey: 'testId' });
TestSubmission.belongsTo(AptitudeTest, { foreignKey: 'testId' });

Application.hasOne(EligibilityVerdict, { foreignKey: 'applicationId' });
EligibilityVerdict.belongsTo(Application, { foreignKey: 'applicationId' });

User.hasMany(AuditLog, { foreignKey: 'userId' });
AuditLog.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ChatbotSession, { foreignKey: 'userId' });
ChatbotSession.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(CandidateResume, { foreignKey: 'userId', as: 'Resumes' });
CandidateResume.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Interview, { foreignKey: 'candidateId', as: 'CandidateInterviews' });
Interview.belongsTo(User, { foreignKey: 'candidateId', as: 'Candidate' });
Interview.belongsTo(User, { foreignKey: 'recruiterId', as: 'Recruiter' });
Interview.belongsTo(Application, { foreignKey: 'applicationId' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'Notifications' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// ─── Sync ─────────────────────────────────────────────────────────────────────
const syncModels = async () => {
  try {
    if (sequelize.getDialect() === 'sqlite') {
      await sequelize.sync();
      // Ensure added columns exist in SQLite tables if migrated
      const safeQueries = [
        'ALTER TABLE applications ADD COLUMN recruiterNotes TEXT;',
        'ALTER TABLE aptitude_tests ADD COLUMN domainId TEXT;',
        'ALTER TABLE aptitude_tests ADD COLUMN startedAt DATETIME;',
        'ALTER TABLE aptitude_tests ADD COLUMN expiresAt DATETIME;',
        'ALTER TABLE aptitude_tests ADD COLUMN mcqScore REAL;',
        'ALTER TABLE aptitude_tests ADD COLUMN codingScore REAL;',
        'ALTER TABLE aptitude_tests ADD COLUMN compositeScore REAL;',
        'ALTER TABLE aptitude_tests ADD COLUMN scoringFormula TEXT;',
        'ALTER TABLE aptitude_tests ADD COLUMN scoringExplanation TEXT;',
        'ALTER TABLE aptitude_tests ADD COLUMN codingSubmissionJson JSON;',
        'ALTER TABLE aptitude_tests ADD COLUMN status TEXT;',
      ];
      for (const q of safeQueries) {
        try { await sequelize.query(q); } catch (_) {}
      }
    } else {
      await sequelize.sync({ alter: true });
    }
    console.log('✅ All database models synced (Candidate Portal v3 schema)');
  } catch (err) {
    console.warn('⚠️ sequelize.sync warning, falling back to basic sync:', err.message);
    await sequelize.sync();
    console.log('✅ Fallback database models synced');
  }
};

module.exports = {
  sequelize,
  syncModels,
  Organisation,
  RecruiterRequest,
  User,
  Job,
  Application,
  AptitudeTest,
  TestSubmission,
  EligibilityVerdict,
  AuditLog,
  ChatbotSession,
  CandidateResume,
  Interview,
  Notification,
  USER_ROLES,
  ORG_STATUS,
  RECRUITER_REQUEST_STATUS,
  AUDIT_ACTIONS,
};
