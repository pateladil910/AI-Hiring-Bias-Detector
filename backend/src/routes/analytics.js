const express = require('express');
const { Op } = require('sequelize');
const { Job, Application, AuditLog, User, TestSubmission } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/analytics/dashboard ─────────────────────────────────────────────
// Real-time calculated KPI metrics and pipeline breakdown for recruiter dashboard
router.get(
  '/dashboard',
  authenticate,
  requireRole('recruiter', 'hr_lead', 'admin', 'compliance'),
  async (req, res) => {
    try {
      const isGlobalRole = ['admin', 'compliance', 'hr_lead'].includes(req.user.role);
      const jobWhere = isGlobalRole ? {} : { createdBy: req.user.id };

      // 1. Get recruiter's jobs
      const jobs = await Job.findAll({
        where: jobWhere,
        attributes: ['id', 'title', 'biasScore', 'status'],
      });

      const jobIds = jobs.map((j) => j.id);
      const totalJobs = jobs.length;
      const publishedJobs = jobs.filter((j) => j.status === 'published').length;

      // Calculate average bias safety score of published JDs
      const publishedWithScores = jobs.filter((j) => j.status === 'published' && j.biasScore !== null);
      const avgBiasScore = publishedWithScores.length > 0
        ? Math.round(
            publishedWithScores.reduce((acc, j) => acc + parseFloat(j.biasScore), 0) /
              publishedWithScores.length
          )
        : null;

      if (jobIds.length === 0) {
        return res.json({
          kpis: {
            totalJobs: 0,
            publishedJobs: 0,
            totalApplications: 0,
            pendingReviewCount: 0,
            avgBiasScore: null,
          },
          pipelineFunnel: {
            applied: 0,
            test_sent: 0,
            test_completed: 0,
            eligible: 0,
            needs_review: 0,
            not_eligible: 0,
            interview: 0,
            hired: 0,
          },
          recentActivities: [],
        });
      }

      // 2. Fetch applications for these jobs
      const applications = await Application.findAll({
        where: { jobId: { [Op.in]: jobIds } },
        attributes: ['id', 'status', 'createdAt'],
      });

      const totalApplications = applications.length;
      const pendingReviewCount = applications.filter((a) => a.status === 'needs_review').length;

      // Group pipeline counts
      const pipelineFunnel = {
        applied: applications.filter((a) => a.status === 'applied').length,
        test_sent: applications.filter((a) => a.status === 'test_sent').length,
        test_completed: applications.filter((a) => a.status === 'test_completed').length,
        eligible: applications.filter((a) => a.status === 'eligible').length,
        needs_review: applications.filter((a) => a.status === 'needs_review').length,
        not_eligible: applications.filter((a) => a.status === 'not_eligible').length,
        interview: applications.filter((a) => a.status === 'interview').length,
        hired: applications.filter((a) => a.status === 'hired').length,
      };

      // 3. Fetch recent 6 audit log entries
      const recentActivities = await AuditLog.findAll({
        include: [
          {
            model: User,
            attributes: ['firstName', 'lastName', 'email', 'role'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: 6,
      });

      return res.json({
        kpis: {
          totalJobs,
          publishedJobs,
          totalApplications,
          pendingReviewCount,
          avgBiasScore,
        },
        pipelineFunnel,
        recentActivities,
      });
    } catch (err) {
      console.error('[ANALYTICS DASHBOARD ERROR]', err.message);
      return res.status(500).json({ error: { code: 'ANALYTICS_FAILED', message: 'Failed to fetch dashboard metrics' } });
    }
  }
);

module.exports = router;
