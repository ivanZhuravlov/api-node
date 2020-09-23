const router = require('express').Router();
const { authenticateToken } = require('../app/middleware/auth.middleware');
const { token, voice, recordCallback } = require('../app/controller/call.controller');

router.get('/token', authenticateToken, token);

router.post('/voice', voice);

router.post('/record-callback/:lead_id/:user_id', recordCallback);

module.exports = router;