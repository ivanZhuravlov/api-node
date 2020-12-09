const router = require('express').Router();

const LeadMiddleware = require('../app/middleware/lead.middleware');
const AuthMiddleware = require('../app/middleware/auth.middleware');

const authenticateToken = AuthMiddleware.authenticateToken;
const checkedAdminRole = AuthMiddleware.checkedAdminRole;
// const checkAssignAgentLead = LeadMiddleware.checkAssignAgentLead;
const findUncompletedLead = LeadMiddleware.findUncompletedLead;

const { test, getLeads, getAll, getLead, getCompaniesListByLeadData, uploadLeadFromMediaAlpha, getRawLeads, uploadLeadFromUrl, getLeadsBySource, getAllLeadsForGuide, getLeadsByFilters } = require('../app/controller/lead.controller');
const { uploadCSV } = require('../app/controller/upload.controller');

router.post('/test', test);
router.get('/raws', authenticateToken, getRawLeads);
router.get('/all', authenticateToken, findUncompletedLead, getAll);
router.get('/guide/all', authenticateToken, getAllLeadsForGuide);
router.get('/all/:type/:user_id', authenticateToken, findUncompletedLead, getLeads);
router.get('/:lead_id', authenticateToken, findUncompletedLead, /*checkAssignAgentLead,*/ getLead);
router.get('/all/:source', authenticateToken, checkedAdminRole, getLeadsBySource);
router.post('/get-companies', getCompaniesListByLeadData);
router.post('/upload/bulk-csv', authenticateToken, uploadCSV)
router.post('/upload/media-alpha', uploadLeadFromMediaAlpha);
router.post('/upload/media-alpha/url', uploadLeadFromUrl);
router.post('/filter', getLeadsByFilters);

module.exports = router;