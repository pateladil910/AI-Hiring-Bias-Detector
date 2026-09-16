/**
 * Audit Controller
 * PDF §10 — Bias Mitigation and Audit Design
 * Answers: what was checked, on which data, using which version,
 *          what was found, and what remains uncertain.
 */
const AuditLog  = require('../models/AuditLog.model');
const Candidate = require('../models/candidate.model');
const Assessment = require('../models/Assessment.model');

// Metric definitions shown alongside audit events
const METRIC_DEFINITIONS = {
  redaction_coverage: {
    name: 'Redaction Coverage',
    description: 'Tracks which identity markers were detected and removed from the resume.',
    what_to_record: 'Detected marker types, redacted fields, review outcome, known limitations.',
    limitations: [
      'Indirect identity cues (e.g. institution prestige, gendered language in project names) may not be fully detected.',
      'Automated redaction may occasionally over-redact (removing relevant skills) or under-redact (missing indirect cues).',
      'Manual review is always recommended for high-stakes decisions.'
    ]
  },
  resume_readability: {
    name: 'Resume Readability',
    description: 'Whether relevant skills and experience remain understandable after redaction.',
    what_to_record: 'Skills retained, extraction quality, candidate confirmation status.',
    limitations: [
      'Skill extraction is keyword-based and may miss synonyms or context-specific skills.',
      'Experience evidence quality depends on resume formatting and structure.'
    ]
  },
  question_language: {
    name: 'Question Language',
    description: 'Assessment questions reviewed for irrelevant demographic cues.',
    what_to_record: 'Question-set version, review date, flagged wording, reviewer outcome.',
    limitations: [
      'This project uses a single versioned question set. Systematic bias review has not been independently validated.',
      'Questions are demo data and not calibrated for any real job role.'
    ]
  },
  assessment_consistency: {
    name: 'Assessment Consistency',
    description: 'Same rubric, time rules, and scoring applied to all candidates for a given assessment.',
    what_to_record: 'Rubric version, question-set version, time rules, accommodations, scoring implementation.',
    limitations: [
      'Timer interruptions due to network issues may affect consistency.',
      'Accommodations process is not yet implemented in this prototype.'
    ]
  },
  access_control: {
    name: 'Access Control',
    description: 'Logs of who accessed candidate data, when, and what was revealed.',
    what_to_record: 'Identity reveal events, privileged access events, unauthorized attempt blocks.',
    limitations: [
      'Log completeness depends on all access paths routing through the API.',
      'Direct database access is not logged here.'
    ]
  },
  result_traceability: {
    name: 'Result Traceability',
    description: 'Full chain of evidence linking inputs to final score.',
    what_to_record: 'Input versions, component results, score formula version, timestamps.',
    limitations: [
      'Scoring formula weights (MCQ×0.4, Coding×0.4, Resume×0.2) are demo defaults and have not been validated for job-relatedness.',
      'Resume match score depends on keyword matching, not semantic understanding.'
    ]
  },
  outcome_monitoring: {
    name: 'Outcome Monitoring',
    description: 'Aggregate analysis of assessment outcomes to detect patterns.',
    what_to_record: 'Sample size, score distributions, limitations, review actions.',
    limitations: [
      'Aggregate analysis requires sufficient sample size and must be governed carefully.',
      'Individual outcome monitoring alone cannot detect systemic bias without comparison data.'
    ]
  }
};

const AUDIT_NOTICE = `⚠️ Important: These metrics reflect automated process checks recorded during assessment. ` +
  `They do not prove zero bias, 100% demographic neutrality, or legal compliance. ` +
  `All results shown are demo/test data. A real audit requires independent validation, ` +
  `qualified review, and sufficient sample sizes.`;

// ═══════════════════════════════════════════════════════════════════
//  GET /api/audit/:candidateRef  — admin only
// ═══════════════════════════════════════════════════════════════════
exports.getAuditEvents = async (req, res) => {
  try {
    const { candidateRef } = req.params;

    const logs = await AuditLog.find({ targetRecord: candidateRef })
      .sort({ timestamp: -1 })
      .populate('actorId', 'role'); // only populate role, not name/email

    // Group by eventType
    const grouped = {};
    logs.forEach(log => {
      const type = log.eventType;
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push({
        id:                log._id,
        eventType:         log.eventType,
        actorRole:         log.actorRole,
        action:            log.action,
        result:            log.result,
        rubricVersion:     log.rubricVersion,
        questionSetVersion: log.questionSetVersion,
        metadata:          log.metadata,
        timestamp:         log.timestamp
      });
    });

    // Attach metric definitions to each group
    const auditReport = Object.entries(grouped).map(([type, events]) => ({
      category:   type,
      definition: METRIC_DEFINITIONS[type] || { name: type, description: 'System event.' },
      events,
      count:      events.length,
      latestResult: events[0]?.result
    }));

    // Candidate summary
    const candidate = await Candidate.findOne({ refId: candidateRef })
      .select('refId cloakedName skills redactedMarkers parseStatus redactionReviewStatus uploadedAt');

    const assessment = await Assessment.findOne({ candidateRef })
      .select('status compositeScore scoringFormula evaluatedAt rubricVersion questionSetVersion');

    res.json({
      success:         true,
      candidateRef,
      auditNotice:     AUDIT_NOTICE,
      candidateSummary: candidate,
      assessmentSummary: assessment,
      metricDefinitions: METRIC_DEFINITIONS,
      auditReport,
      totalEvents:     logs.length,
      generatedAt:     new Date().toISOString()
    });

  } catch (err) {
    console.error('[Audit] getAuditEvents error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  GET /api/audit/my  — candidate's own audit (limited fields)
// ═══════════════════════════════════════════════════════════════════
exports.getCandidateAudit = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ userId: req.user.id });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'No candidate profile found. Please upload your resume first.'
      });
    }

    // Only show safe event types to candidate
    const allowedTypes = [
      'upload', 'redaction_coverage', 'resume_readability',
      'assessment_consistency', 'result_traceability', 'submission'
    ];

    const logs = await AuditLog.find({
      targetRecord: candidate.refId,
      eventType:    { $in: allowedTypes }
    })
    .select('eventType action result timestamp metadata')
    .sort({ timestamp: -1 });

    const grouped = {};
    logs.forEach(log => {
      const type = log.eventType;
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push({
        eventType: log.eventType,
        action:    log.action,
        result:    log.result,
        timestamp: log.timestamp,
        metadata:  log.metadata
      });
    });

    const auditReport = Object.entries(grouped).map(([type, events]) => ({
      category:   type,
      definition: METRIC_DEFINITIONS[type] || { name: type, description: 'System event.' },
      events,
      latestResult: events[0]?.result
    }));

    res.json({
      success:      true,
      refId:        candidate.refId,
      auditNotice:  AUDIT_NOTICE,
      auditReport,
      totalEvents:  logs.length,
      generatedAt:  new Date().toISOString()
    });

  } catch (err) {
    console.error('[Audit] getCandidateAudit error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
