/**
 * Candidate Controller
 * Handles candidate's own application progress view.
 * PDF §5 Step 3 — Candidate Dashboard
 */
const Candidate  = require('../models/candidate.model');
const Assessment = require('../models/Assessment.model');

// ═══════════════════════════════════════════════════════════════════
//  GET /api/candidate/application
// ═══════════════════════════════════════════════════════════════════
exports.getApplication = async (req, res) => {
  try {
    const candidate  = await Candidate.findOne({ userId: req.user.id });
    const assessment = await Assessment.findOne({ userId: req.user.id })
      .sort({ createdAt: -1 }); // most recent

    // Calculate which steps are complete
    const resumeUploaded    = !!candidate;
    const profileConfirmed  = candidate && ['confirmed', 'corrected'].includes(candidate.redactionReviewStatus);
    const domainSelected    = !!assessment;
    const mcqComplete       = assessment && !['not_started', 'in_progress'].includes(assessment.status);
    const resultsReady      = assessment && ['complete', 'recruiter_review_pending', 'review_completed'].includes(assessment.status);

    const steps = [
      {
        step:        1,
        key:         'resume_upload',
        label:       'Resume Upload',
        description: 'Upload your resume for anonymized processing.',
        status:      profileConfirmed ? 'complete' : resumeUploaded ? 'in_progress' : 'not_started',
        complete:    profileConfirmed,
        action:      profileConfirmed ? null : resumeUploaded ? 'Confirm your redacted profile' : 'Upload your resume',
        href:        profileConfirmed ? null : resumeUploaded ? 'resume-analysis.html' : 'upload-resume.html',
        completedAt: candidate?.uploadedAt || null
      },
      {
        step:        2,
        key:         'domain_selection',
        label:       'Domain Selection',
        description: 'Choose the technical domain for your assessment.',
        status:      domainSelected ? 'complete' : profileConfirmed ? 'not_started' : 'locked',
        complete:    domainSelected,
        action:      !domainSelected && profileConfirmed ? 'Select your domain' : null,
        href:        !domainSelected && profileConfirmed ? 'select-domain.html' : null,
        completedAt: assessment?.createdAt || null
      },
      {
        step:        3,
        key:         'mcq_assessment',
        label:       'MCQ Assessment',
        description: 'Timed multiple-choice and aptitude questions.',
        status:      mcqComplete ? 'complete' : (domainSelected && assessment?.status === 'in_progress') ? 'in_progress' : domainSelected ? 'not_started' : 'locked',
        complete:    mcqComplete,
        action:      assessment?.status === 'in_progress' ? 'Continue assessment' : domainSelected && !mcqComplete ? 'Start assessment' : null,
        href:        (assessment?.status === 'in_progress' || (domainSelected && !mcqComplete)) ? `assessment.html?id=${assessment?._id}` : null,
        completedAt: mcqComplete ? assessment?.submittedAt : null
      },
      {
        step:        4,
        key:         'coding_challenge',
        label:       'Coding Challenge',
        description: 'Submit a coding solution evaluated against test cases.',
        status:      resultsReady ? 'complete' : mcqComplete ? 'not_started' : 'locked',
        complete:    resultsReady,
        action:      mcqComplete && !resultsReady ? 'Start coding challenge' : null,
        href:        mcqComplete && !resultsReady ? `coding-test.html?id=${assessment?._id}` : null,
        completedAt: resultsReady ? assessment?.evaluatedAt : null
      },
      {
        step:        5,
        key:         'results',
        label:       'Results',
        description: 'View your component scores and assessment outcome.',
        status:      resultsReady ? 'complete' : 'locked',
        complete:    resultsReady,
        action:      resultsReady ? 'View your results' : null,
        href:        resultsReady ? 'final-score.html' : null,
        completedAt: resultsReady ? assessment?.evaluatedAt : null
      }
    ];

    // Find the current active step
    const currentStep = steps.find(s => s.status === 'in_progress' || s.status === 'not_started') || steps[steps.length - 1];

    res.json({
      success: true,
      candidateRef:   candidate?.refId || null,
      cloakedName:    candidate?.cloakedName || 'Candidate',
      assessmentId:   assessment?._id || null,
      assessmentStatus: assessment?.status || 'not_started',
      statusLabel:    assessment?.statusLabel || 'Not started',
      steps,
      currentStep:    currentStep.step,
      completedSteps: steps.filter(s => s.complete).length,
      totalSteps:     steps.length
    });

  } catch (err) {
    console.error('[Candidate] getApplication error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
