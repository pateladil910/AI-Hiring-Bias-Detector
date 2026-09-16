/**
 * Resume Controller
 * Handles: upload, parse, redact, profile retrieval, and profile confirmation.
 * PDF §5 Steps 4 & 5 — Resume Upload and Anonymize
 */
const path = require('path');
const fs   = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const pdfParse = require('pdf-parse');

const Candidate = require('../models/candidate.model');
const AuditLog  = require('../models/AuditLog.model');

// ─── Multer Config ────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = crypto.randomBytes(16).toString('hex') + ext;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are accepted.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

// ─── Redaction Engine ─────────────────────────────────────────────
function redactText(text) {
  const markers = [];
  let redacted  = text;

  // Email addresses
  const emailRx = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  if (emailRx.test(redacted)) {
    markers.push('email');
    redacted = redacted.replace(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, '[REDACTED-EMAIL]');
  }

  // Phone numbers (various formats)
  const phoneRx = /(\+?\d[\d\s\-().]{7,}\d)/g;
  if (phoneRx.test(redacted)) {
    markers.push('phone');
    redacted = redacted.replace(/(\+?\d[\d\s\-().]{7,}\d)/g, '[REDACTED-PHONE]');
  }

  // LinkedIn URLs
  if (/linkedin\.com\//i.test(redacted)) {
    markers.push('linkedin');
    redacted = redacted.replace(/https?:\/\/(www\.)?linkedin\.com\/[^\s]*/gi, '[REDACTED-LINKEDIN]');
  }

  // GitHub URLs
  if (/github\.com\//i.test(redacted)) {
    markers.push('github_url');
    redacted = redacted.replace(/https?:\/\/(www\.)?github\.com\/[^\s]*/gi, '[REDACTED-GITHUB]');
  }

  // Street address patterns
  const addrRx = /\d{1,5}\s+\w+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Way|Place|Pl)\b[^,\n]*/gi;
  if (addrRx.test(redacted)) {
    markers.push('address');
    redacted = redacted.replace(/\d{1,5}\s+\w+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Way|Place|Pl)\b[^,\n]*/gi, '[REDACTED-ADDRESS]');
  }

  // Gendered pronouns (flag, not remove)
  if (/\b(he|she|him|her|his|hers|himself|herself)\b/i.test(redacted)) {
    markers.push('gender_pronoun');
    // Replace with neutral [THEY/THEM] to keep readability
    redacted = redacted.replace(/\b(he|she)\b/gi, '[THEY]')
                       .replace(/\b(him|her)\b/gi, '[THEM]')
                       .replace(/\b(his|hers)\b/gi, '[THEIR]')
                       .replace(/\b(himself|herself)\b/gi, '[THEMSELVES]');
  }

  // Date of birth / age patterns
  const ageRx = /\b(DOB|Date of Birth|Age|Born)[:\s]+[\w\s,\/\-]+\d{4}\b/gi;
  if (ageRx.test(redacted)) {
    markers.push('age_indicator');
    redacted = redacted.replace(/\b(DOB|Date of Birth|Age|Born)[:\s]+[\w\s,\/\-]+\d{4}\b/gi, '[REDACTED-AGE]');
  }

  // Photo/image references
  if (/\.(jpg|jpeg|png|gif|bmp|webp)/i.test(redacted)) {
    markers.push('photo');
    redacted = redacted.replace(/\S+\.(jpg|jpeg|png|gif|bmp|webp)/gi, '[REDACTED-PHOTO]');
  }

  return { redactedText: redacted, markers: [...new Set(markers)] };
}

// ─── Extract Skills from Text ─────────────────────────────────────
function extractSkills(text) {
  const skillKeywords = [
    // Languages
    'JavaScript','TypeScript','Python','Java','C#','C++','Go','Rust','PHP','Ruby','Swift','Kotlin','Scala',
    // Frontend
    'React','Angular','Vue','Next.js','Nuxt','HTML5','CSS3','Tailwind','Bootstrap','SASS','SCSS','Redux',
    // Backend
    'Node.js','Express','Django','FastAPI','Spring','Laravel','Flask','NestJS','GraphQL','REST API',
    // Databases
    'MongoDB','PostgreSQL','MySQL','Redis','SQLite','Cassandra','DynamoDB','Firebase','SQL',
    // DevOps / Cloud
    'Docker','Kubernetes','AWS','Azure','GCP','Terraform','CI/CD','GitHub Actions','Jenkins','Linux','Bash',
    // Data / ML
    'Pandas','NumPy','scikit-learn','TensorFlow','PyTorch','Machine Learning','Data Analysis','SQL','Tableau','Power BI',
    // Tools
    'Git','GitHub','Jira','Figma','Postman','VS Code','IntelliJ',
    // Concepts
    'Microservices','Agile','Scrum','TDD','Unit Testing','REST','OAuth','JWT','OOP','SOLID'
  ];

  const found = [];
  const textUpper = text.toUpperCase();
  skillKeywords.forEach(skill => {
    if (textUpper.includes(skill.toUpperCase())) {
      found.push(skill);
    }
  });
  return [...new Set(found)];
}

// ─── Extract Experience Years ─────────────────────────────────────
function extractExperienceYears(text) {
  const match = text.match(/(\d+)\+?\s*(year|yr)/i);
  if (match) return parseInt(match[1]);
  // Count graduation years as proxy
  const yearMatches = text.match(/20\d{2}/g) || [];
  if (yearMatches.length >= 2) {
    const years = yearMatches.map(Number).sort();
    return Math.min(new Date().getFullYear() - years[0], 20);
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════
//  POST /api/resume/upload
// ═══════════════════════════════════════════════════════════════════
exports.upload = upload; // expose multer middleware

exports.uploadAndAnonymize = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded. Please select a PDF or DOCX file.' });
    }

    const filePath   = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    let   rawText    = '';
    let   extractionNotes = [];

    // ── Extract text ─────────────────────────────────────────────
    if (req.file.mimetype === 'application/pdf') {
      try {
        const data = await pdfParse(fileBuffer);
        rawText = data.text || '';
        if (!rawText.trim()) {
          extractionNotes.push('PDF appears to contain scanned images rather than extractable text.');
        }
      } catch (parseErr) {
        // Clean up and return error
        fs.unlinkSync(filePath);
        return res.status(422).json({ success: false, message: 'Could not extract text from this PDF. Please try a text-based PDF.' });
      }
    } else {
      // DOCX: try basic text extraction (mammoth would be ideal but adds dependency)
      rawText = fileBuffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
      extractionNotes.push('DOCX parsing is limited in this demo — some formatting may be lost.');
    }

    if (!rawText.trim()) {
      fs.unlinkSync(filePath);
      return res.status(422).json({ success: false, message: 'Could not extract any text from the uploaded file.' });
    }

    // ── Redact ───────────────────────────────────────────────────
    const { redactedText, markers } = redactText(rawText);
    const skills = extractSkills(rawText); // extract from raw (before redaction)
    const expYears = extractExperienceYears(rawText);

    // ── Check for existing candidate profile ─────────────────────
    let candidate = await Candidate.findOne({ userId: req.user.id });

    // Generate unique refId
    const refId = candidate ? candidate.refId : 'CAND-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    if (candidate) {
      // Update existing profile
      candidate.resumeTextRedacted = redactedText;
      candidate.resumeFileRef      = filePath;
      candidate.redactedMarkers    = markers;
      candidate.skills             = skills;
      candidate.parsedExperienceYears = expYears;
      candidate.parseStatus        = 'redacted';
      candidate.redactionReviewStatus = 'pending_review';
      candidate.consentTimestamp   = new Date();
      await candidate.save();
    } else {
      candidate = await Candidate.create({
        userId:              req.user.id,
        refId,
        cloakedName:         'Candidate ' + refId,
        resumeTextRedacted:  redactedText,
        resumeFileRef:       filePath,
        redactedMarkers:     markers,
        skills,
        parsedExperienceYears: expYears,
        parseStatus:         'redacted',
        redactionReviewStatus: 'pending_review',
        consentTimestamp:    new Date()
      });
    }

    // ── Audit Event ──────────────────────────────────────────────
    await AuditLog.create({
      eventType:   'upload',
      actorRole:   req.user.role,
      actorId:     req.user.id,
      targetRecord: refId,
      action:      'Resume uploaded, parsed, and redacted',
      result:      'redacted',
      rubricVersion: '1.0',
      metadata: {
        markersDetected: markers,
        skillsExtracted: skills.length,
        fileSize:        req.file.size,
        mimeType:        req.file.mimetype
      }
    });

    // Audit: redaction coverage check
    await AuditLog.create({
      eventType:   'redaction_coverage',
      actorRole:   'system',
      actorId:     req.user.id,
      targetRecord: refId,
      action:      'Automated redaction applied',
      result:      markers.length > 0 ? 'markers_redacted' : 'no_markers_found',
      metadata: {
        detectedMarkers: markers,
        limitations: [
          'Indirect identity cues (e.g. institution reputation) may not be fully detected.',
          'Names not in standard contact sections may remain.',
          'Manual review is recommended to verify redaction quality.'
        ]
      }
    });

    res.status(200).json({
      success:         true,
      refId,
      detectedMarkers: markers,
      redactedPreview: redactedText.substring(0, 1500) + (redactedText.length > 1500 ? '...' : ''),
      skills,
      experienceYears: expYears,
      extractionNotes,
      message: 'Resume uploaded and anonymized successfully. Please review the redacted profile below.'
    });

  } catch (err) {
    console.error('[Resume] uploadAndAnonymize error:', err.message);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: 'Upload failed. Please try again.' });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  GET /api/resume/profile/:refId
// ═══════════════════════════════════════════════════════════════════
exports.getParsedProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ refId: req.params.refId });
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate profile not found.' });

    // Authorization: candidate can only see their own; recruiter/admin can see any
    if (req.user.role === 'candidate' && candidate.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Never return userId or original file path to candidates/recruiters
    res.json({
      success: true,
      refId:              candidate.refId,
      cloakedName:        candidate.cloakedName,
      skills:             candidate.skills,
      parsedExperienceYears: candidate.parsedExperienceYears,
      redactedMarkers:    candidate.redactedMarkers,
      resumeTextRedacted: candidate.resumeTextRedacted,
      parseStatus:        candidate.parseStatus,
      redactionReviewStatus: candidate.redactionReviewStatus,
      uploadedAt:         candidate.uploadedAt
    });
  } catch (err) {
    console.error('[Resume] getParsedProfile error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  POST /api/resume/confirm/:refId
// ═══════════════════════════════════════════════════════════════════
exports.confirmProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({
      refId:  req.params.refId,
      userId: req.user.id
    });
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate profile not found.' });

    candidate.redactionReviewStatus = 'confirmed';
    candidate.parseStatus           = 'reviewed';
    if (req.body.correctionNote) {
      candidate.extractionNotes = req.body.correctionNote;
      candidate.redactionReviewStatus = 'corrected';
    }
    await candidate.save();

    await AuditLog.create({
      eventType:   'redaction_coverage',
      actorRole:   req.user.role,
      actorId:     req.user.id,
      targetRecord: candidate.refId,
      action:      req.body.correctionNote ? 'Candidate reported extraction issue' : 'Candidate confirmed redaction profile',
      result:      candidate.redactionReviewStatus,
      metadata: {
        correctionProvided: !!req.body.correctionNote
      }
    });

    // Audit: resume readability check
    await AuditLog.create({
      eventType:   'resume_readability',
      actorRole:   'system',
      actorId:     req.user.id,
      targetRecord: candidate.refId,
      action:      'Resume readability check after redaction',
      result:      candidate.skills.length > 0 ? 'skills_retained' : 'no_skills_found',
      metadata: {
        skillsRetained: candidate.skills,
        count: candidate.skills.length
      }
    });

    res.json({
      success: true,
      message:  req.body.correctionNote ? 'Correction noted. Thank you.' : 'Profile confirmed successfully.',
      status:   candidate.redactionReviewStatus
    });
  } catch (err) {
    console.error('[Resume] confirmProfile error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
