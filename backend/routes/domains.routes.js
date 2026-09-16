const express = require('express');
const router = express.Router();
const { getAllDomains } = require('../controllers/domains.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/', verifyToken, getAllDomains);

module.exports = router;
