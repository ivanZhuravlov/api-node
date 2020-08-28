const router = require('express').Router();
const { authenticateToken } = require('../app/middleware/authMiddleware');
const { test, getLeads, getLead, getCompaniesListByLeadData, processLeadDashoard, uploadLeadFromMediaAlpha, uploadLeadFromUrl } = require('../app/controller/leadController');

router.post('/get-leads', authenticateToken, getLeads);
router.post('/get-lead', authenticateToken, getLead);
router.post('/get-companies', getCompaniesListByLeadData);
router.post('/dashboard/process-lead', authenticateToken, processLeadDashoard);
router.post('/upload/media-alpha', authenticateToken, uploadLeadFromMediaAlpha);
router.post('/upload/media-alpha/url', authenticateToken, uploadLeadFromUrl);
router.post('/test', test);

module.exports = router;