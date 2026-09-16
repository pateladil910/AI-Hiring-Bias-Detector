/**
 * Recruiter Controller
 * PDF §5 Step 12 — Recruiter Review
 * Handles: anonymized candidate pool, candidate detail, record human review
 */
const Candidate      = require('../models/candidate.model');
const Assessment     = require('../models/Assessment.model');
const AuditLog       = require('../models/AuditLog.model');
const RecruiterReview = require('../models/RecruiterReview.model');

// ═══════════════════════════════════════════════════════════════════
//  GET /api/recruiter/candidates?domain=&status=
// ═══════════════════════════════════════════════════════════════════
exports.getCandidates = async (req, res) => {
  try {
    const { domain, status } = req.query;

    // Build filter — only show assessments that have been submitted
    const filter = {
      status: { $in: ['recruiter_review_pending', 'review_completed', 'complete'] }
    };
    if (domain)  filter.domainId = domain;
    if (status)  filter.status   = status;

    const assessments = await Assessment.find(filter)
      .sort({ submittedAt: -1 });

    if (!assessments.length) {
      return res.json({ success: true, candidates: [], message: 'No candidates in the pool matching your filters.' });
    }

    // Gather all refIds and look up candidate profiles in bulk
    const refIds     = assessments.map(a => a.candidateRef);
    const candidates = await Candidate.find({ refId: { $in: refIds } })
      .select('-userId -resumeFileRef -resumeTextRedacted'); // strip identity fields

    const candidateMap = {};
    candidates.forEach(c => { candidateMap[c.refId] = c; });

    // Build anonymized pool — NEVER include real name, email, userId
    const pool = assessments.map(a => {
      const cand = candidateMap[a.candidateRef] || {};
      return {
        refId:        a.candidateRef,
        cloakedName:  cand.cloakedName || a.candidateRef,
        domainId:     a.domainId,
        status:       a.status,
        statusLabel:  a.statusLabel || a.status,
        scores: {
          mcq:         a.mcqScore,
          coding:      a.codingScore,
          resumeMatch: a.resumeMatchScore,
          composite:   a.compositeScore
        },
        skills:       cand.skills || [],
        submittedAt:  a.submittedAt,
        assessmentId: a._id
      };
    });

    // Audit: recruiter viewed pool
    await AuditLog.create({
      eventType:   'access_control',
      actorRole:   req.user.role,
      actorId:     req.user.id,
      action:      'Recruiter viewed anonymized candidate pool',
      result:      'success',
      metadata:    { filters: { domain, status }, count: pool.length }
    });

    res.json({ success: true, candidates: pool, total: pool.length });

  } catch (err) {
    console.error('[Recruiter] getCandidates error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  GET /api/recruiter/candidates/:refId
// ═══════════════════════════════════════════════════════════════════
exports.getCandidateDetail = async (req, res) => {
  try {
    const { refId } = req.params;

    const candidate  = await Candidate.findOne({ refId })
      .select('-userId -resumeFileRef'); // never expose userId or file path

    const assessment = await Assessment.findOne({ candidateRef: refId })
      .select('-userId -mcqAnswers -aptitudeAnswers'); // don't expose raw answers

    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found.' });
    if (!assessment) {
      return res.json({
        success: true,
        candidate: { refId: candidate.refId, cloakedName: candidate.cloakedName, skills: candidate.skills },
        assessment: null
      });
    }

    // Fetch any existing review
    const review = await RecruiterReview.findOne({ candidateRef: refId })
      .sort({ reviewedAt: -1 });

    // Audit: recruiter viewed candidate detail
    await AuditLog.create({
      eventType:   'access_control',
      actorRole:   req.user.role,
      actorId:     req.user.id,
      targetRecord: refId,
      action:      'Recruiter viewed candidate detail',
      result:      'success',
      metadata:    { identityConcealed: true }
    });

    res.json({
      success: true,
      candidate: {
        refId:               candidate.refId,
        cloakedName:         candidate.cloakedName,
        skills:              candidate.skills,
        parsedExperienceYears: candidate.parsedExperienceYears,
        redactedMarkers:     candidate.redactedMarkers,
        parseStatus:         candidate.parseStatus,
        redactionVersion:    candidate.redactionVersion,
        uploadedAt:          candidate.uploadedAt,
        // NOTE: resumeTextRedacted intentionally omitted from recruiter view (only partial shown)
        resumeSnippet:       candidate.resumeTextRedacted
          ? candidate.resumeTextRedacted.substring(0, 800) + '...'
          : null
      },
      assessment: {
        assessmentId:        assessment._id,
        domainId:            assessment.domainId,
        rubricVersion:       assessment.rubricVersion,
        questionSetVersion:  assessment.questionSetVersion,
        status:              assessment.status,
        statusLabel:         assessment.statusLabel,
        scores: {
          mcq:          assessment.mcqScore,
          coding:       assessment.codingScore,
          resumeMatch:  assessment.resumeMatchScore,
          composite:    assessment.compositeScore
        },
        scoringFormula:      assessment.scoringFormula,
        scoringExplanation:  assessment.scoringExplanation,
        codingTestSummary:   assessment.codingSubmission ? {
          testsPassed: assessment.codingSubmission.testsPassed,
          testsTotal:  assessment.codingSubmission.testsTotal,
          language:    assessment.codingSubmission.language,
          submittedAt: assessment.codingSubmission.submittedAt
        } : null,
        startedAt:           assessment.startedAt,
        submittedAt:         assessment.submittedAt,
        evaluatedAt:         assessment.evaluatedAt
      },
      existingReview: review ? {
        outcome:          review.outcome,
        reason:           review.reason,
        reviewedAt:       review.reviewedAt,
        identityRevealed: review.identityRevealed
      } : null,
      notice: 'Candidate identity is concealed during blind review. Do not sort solely by composite score — review all evidence.'
    });

  } catch (err) {
    console.error('[Recruiter] getCandidateDetail error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  POST /api/recruiter/reviews
// ═══════════════════════════════════════════════════════════════════
exports.recordReview = async (req, res) => {
  try {
    const { candidateRef, assessmentId, outcome, reason, identityRevealed } = req.body;

    if (!candidateRef || !outcome || !reason) {
      return res.status(400).json({
        success: false,
        message: 'candidateRef, outcome, and reason are required.'
      });
    }

    const validOutcomes = ['advance', 'hold', 'decline', 'review_complete'];
    if (!validOutcomes.includes(outcome)) {
      return res.status(400).json({
        success: false,
        message: `outcome must be one of: ${validOutcomes.join(', ')}`
      });
    }

    if (!reason.trim() || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'A meaningful reason (at least 10 characters) is required.'
      });
    }

    // Save the review
    const review = await RecruiterReview.create({
      reviewerId:      req.user.id,
      candidateRef,
      assessmentId:    assessmentId || undefined,
      outcome,
      reason:          reason.trim(),
      identityRevealed: !!identityRevealed,
      reviewedAt:      new Date()
    });

    // Update assessment status
    await Assessment.findOneAndUpdate(
      { candidateRef, status: { $ne: 'review_completed' } },
      {
        status:      'review_completed',
        statusLabel: `Review completed — outcome: ${outcome}`
      }
    );

    // Audit: review recorded
    await AuditLog.create({
      eventType:   'review',
      actorRole:   req.user.role,
      actorId:     req.user.id,
      targetRecord: candidateRef,
      action:      'Recruiter recorded human review decision',
      result:      outcome,
      metadata:    {
        outcome,
        identityRevealed: !!identityRevealed,
        reasonLength:     reason.trim().length
      }
    });

    // If identity was revealed, create extra audit event
    if (identityRevealed) {
      await AuditLog.create({
        eventType:   'identity_reveal',
        actorRole:   req.user.role,
        actorId:     req.user.id,
        targetRecord: candidateRef,
        action:      'Authorized identity reveal during review',
        result:      'revealed',
        metadata:    { reviewId: review._id.toString() }
      });
    }

    res.status(201).json({
      success:    true,
      reviewId:   review._id,
      outcome,
      message:    'Review recorded successfully. Thank you for completing the evaluation.'
    });

  } catch (err) {
    console.error('[Recruiter] recordReview error:', err.message);
    res.status(500).json({ success: false, message: 'Could not save review. Please try again.' });
  }
};
