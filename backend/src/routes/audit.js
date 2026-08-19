const express = require('express');
const { Op } = require('sequelize');
const { AuditLog, User } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/audit ───────────────────────────────────────────────────────────
// Filterable, paginated audit log list for recruiters and compliance officers
router.get(
  '/',
  authenticate,
  requireRole('recruiter', 'hr_lead', 'admin', 'compliance'),
  async (req, res) => {
    try {
      const {
        action,
        entityType,
        search,
        from,
        to,
        page = 1,
        limit = 20,
      } = req.query;

      const where = {};

      if (action) {
        where.action = action;
      }

      if (entityType) {
        where.entityType = entityType;
      }

      if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt[Op.gte] = new Date(from);
        if (to) {
          const toDate = new Date(to);
          toDate.setHours(23, 59, 59, 999);
          where.createdAt[Op.lte] = toDate;
        }
      }

      if (search && search.trim()) {
        const searchPattern = `%${search.trim()}%`;
        where[Op.or] = [
          { action: { [Op.iLike]: searchPattern } },
          { reason: { [Op.iLike]: searchPattern } },
        ];
      }

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
      const offset = (pageNum - 1) * pageSize;

      const { count, rows } = await AuditLog.findAndCountAll({
        where,
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: pageSize,
        offset,
      });

      return res.json({
        logs: rows,
        total: count,
        page: pageNum,
        totalPages: Math.ceil(count / pageSize),
      });
    } catch (err) {
      console.error('[AUDIT LIST ERROR]', err.message);
      return res.status(500).json({ error: { code: 'AUDIT_FETCH_FAILED', message: 'Failed to fetch audit logs' } });
    }
  }
);

// ─── GET /api/audit/stats ─────────────────────────────────────────────────────
// Summary counters for compliance dashboard
router.get(
  '/stats',
  authenticate,
  requireRole('recruiter', 'hr_lead', 'admin', 'compliance'),
  async (req, res) => {
    try {
      const [
        totalLogs,
        overridesCount,
        verdictsCount,
        testsCount,
        jobsCount,
      ] = await Promise.all([
        AuditLog.count(),
        AuditLog.count({ where: { action: 'ELIGIBILITY_OVERRIDDEN' } }),
        AuditLog.count({ where: { action: 'ELIGIBILITY_COMPUTED' } }),
        AuditLog.count({ where: { action: { [Op.in]: ['TEST_GENERATED', 'TEST_SUBMITTED'] } } }),
        AuditLog.count({ where: { action: { [Op.in]: ['JOB_PUBLISHED', 'JOB_UNPUBLISHED', 'JD_ANALYZED'] } } }),
      ]);

      return res.json({
        totalLogs,
        overridesCount,
        verdictsCount,
        testsCount,
        jobsCount,
      });
    } catch (err) {
      console.error('[AUDIT STATS ERROR]', err.message);
      return res.status(500).json({ error: { code: 'STATS_FETCH_FAILED', message: 'Failed to fetch audit stats' } });
    }
  }
);

// ─── GET /api/audit/export/csv ────────────────────────────────────────────────
// Download audit logs in CSV format for legal compliance
router.get(
  '/export/csv',
  authenticate,
  requireRole('recruiter', 'hr_lead', 'admin', 'compliance'),
  async (req, res) => {
    try {
      const { action, from, to } = req.query;
      const where = {};

      if (action) where.action = action;
      if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt[Op.gte] = new Date(from);
        if (to) {
          const toDate = new Date(to);
          toDate.setHours(23, 59, 59, 999);
          where.createdAt[Op.lte] = toDate;
        }
      }

      const logs = await AuditLog.findAll({
        where,
        include: [
          {
            model: User,
            attributes: ['firstName', 'lastName', 'email', 'role'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: 1000,
      });

      // Format CSV
      const headers = ['Log ID', 'Timestamp (UTC)', 'Action', 'Entity Type', 'Entity ID', 'User Name', 'User Email', 'User Role', 'Reason', 'Meta JSON'];
      const escapeCSV = (val) => {
        if (val === null || val === undefined) return '""';
        const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      };

      const rows = logs.map((log) => [
        escapeCSV(log.id),
        escapeCSV(log.createdAt?.toISOString()),
        escapeCSV(log.action),
        escapeCSV(log.entityType),
        escapeCSV(log.entityId),
        escapeCSV(log.User ? `${log.User.firstName} ${log.User.lastName}` : 'System'),
        escapeCSV(log.User?.email || 'N/A'),
        escapeCSV(log.User?.role || 'N/A'),
        escapeCSV(log.reason || ''),
        escapeCSV(log.meta || {}),
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="fairhire_audit_trail_${Date.now()}.csv"`);
      return res.status(200).send(csvContent);
    } catch (err) {
      console.error('[AUDIT CSV EXPORT ERROR]', err.message);
      return res.status(500).json({ error: { code: 'CSV_EXPORT_FAILED', message: 'Failed to export audit CSV' } });
    }
  }
);

module.exports = router;
