const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// ─── Enums ────────────────────────────────────────────────────────────────────
const USER_ROLES = ['admin', 'hr_lead', 'recruiter', 'compliance', 'candidate'];
const JOB_STATUS = ['draft', 'published', 'closed'];
const APPLICATION_STATUS = ['applied', 'test_sent', 'test_completed', 'eligible', 'not_eligible', 'needs_review', 'interview', 'rejected', 'hired'];
const VERDICT = ['eligible', 'not_eligible', 'needs_review'];

// ─── Organisation ─────────────────────────────────────────────────────────────
const Organisation = sequelize.define('Organisation', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
}, { tableName: 'organisations', timestamps: true });

// ─── User ─────────────────────────────────────────────────────────────────────
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM(...USER_ROLES), allowNull: false, defaultValue: 'candidate' },
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
  resumeUrl: { type: DataTypes.STRING, defaultValue: null },
  anonymisedText: { type: DataTypes.TEXT, defaultValue: null },
  resumeBiasScore: { type: DataTypes.FLOAT, defaultValue: null },
  status: { type: DataTypes.ENUM(...APPLICATION_STATUS), defaultValue: 'applied' },
}, { tableName: 'applications', timestamps: true });

// ─── Aptitude Test ────────────────────────────────────────────────────────────
const AptitudeTest = sequelize.define('AptitudeTest', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  questionsJson: { type: DataTypes.JSONB, allowNull: false },
  generatedFromSkillProfile: { type: DataTypes.JSONB, defaultValue: null },
  timeLimitMinutes: { type: DataTypes.INTEGER, defaultValue: 30 },
}, { tableName: 'aptitude_tests', timestamps: true });

// ─── Test Submission ──────────────────────────────────────────────────────────
const TestSubmission = sequelize.define('TestSubmission', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
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
  entityId: { type: DataTypes.UUID, allowNull: false },
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

// ─── Sync ─────────────────────────────────────────────────────────────────────
const syncModels = async () => {
  await sequelize.sync({ alter: true });
  console.log('✅ All database models synced');
};

module.exports = {
  sequelize,
  syncModels,
  Organisation,
  User,
  Job,
  Application,
  AptitudeTest,
  TestSubmission,
  EligibilityVerdict,
  AuditLog,
  ChatbotSession,
  USER_ROLES,
};
