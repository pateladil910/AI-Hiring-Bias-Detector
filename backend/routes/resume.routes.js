const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { uploadAndAnonymize, getParsedProfile, confirmProfile } = require('../controllers/resume.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { uploadLimiter } = require('../middleware/rateLimiter');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uuid = crypto.randomUUID();
    cb(null, `${uuid}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed!'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

router.post('/upload', verifyToken, requireRole('candidate'), uploadLimiter, upload.single('resume'), uploadAndAnonymize);
router.get('/profile/:refId', verifyToken, getParsedProfile);
router.post('/confirm/:refId', verifyToken, requireRole('candidate'), confirmProfile);

module.exports = router;
