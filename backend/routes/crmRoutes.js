const express = require('express');
const router = express.Router();
const crmController = require('../controllers/crmController');
const { requireAuth } = require('../middleware/authMiddleware');
const uploadService = require('../services/uploadService');

const allowedStages = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

const validateStageBody = (req, res, next) => {
  const { stage } = req.body;
  if (stage && !allowedStages.includes(stage)) {
    return res.status(400).json({
      error: `Invalid stage. Allowed values: ${allowedStages.join(', ')}`,
    });
  }
  next();
};

const validateStageQuery = (req, res, next) => {
  const { stage } = req.query;
  if (stage && !allowedStages.includes(stage)) {
    return res.status(400).json({
      error: `Invalid stage. Allowed values: ${allowedStages.join(', ')}`,
    });
  }
  next();
};

router.get('/stats', requireAuth, crmController.getStats);

// Customer routes
router.post('/customers', requireAuth, crmController.createCustomer);
router.get('/customers', requireAuth, crmController.getCustomers);
router.get('/customers/:id', requireAuth, crmController.getCustomerById);
router.put('/customers/:id', requireAuth, crmController.updateCustomer);
router.delete('/customers/:id', requireAuth, crmController.deleteCustomer);
router.post('/customers/import', requireAuth, uploadService.upload.single('file'), crmController.importCustomers);
router.get('/customers/export', requireAuth, crmController.exportCustomers);
router.get('/customers/:id/interactions', requireAuth, crmController.getInteractionsByCustomer);
router.post('/customers/:id/interactions', requireAuth, uploadService.upload.single('file'), crmController.createInteractionForCustomer);
router.post('/customers/:id/tags/:tagId', requireAuth, crmController.assignTagToCustomer);
router.delete('/customers/:id/tags/:tagId', requireAuth, crmController.unassignTagFromCustomer);
router.post('/customers/:id/convert', requireAuth, crmController.convertCustomerToUser);

// Lead routes
router.post('/leads', requireAuth, validateStageBody, crmController.createLead);
router.get('/leads', requireAuth, validateStageQuery, crmController.getLeads);
router.get('/leads/:id', requireAuth, crmController.getLeadById);
router.put('/leads/:id', requireAuth, validateStageBody, crmController.updateLead);
router.post('/leads/:id/convert', requireAuth, crmController.convertLeadToCustomer);
router.delete('/leads/:id', requireAuth, crmController.deleteLead);
router.post('/leads/:id/convert', requireAuth, crmController.convertLeadToCustomer);
router.post('/leads/import', requireAuth, uploadService.upload.single('file'), crmController.importLeads);
router.get('/leads/export', requireAuth, crmController.exportLeads);
router.get('/leads/:id/interactions', requireAuth, crmController.getInteractionsByLead);
router.post('/leads/:id/interactions', requireAuth, uploadService.upload.single('file'), crmController.createInteractionForLead);
router.post('/leads/:id/tags/:tagId', requireAuth, crmController.assignTagToLead);
router.delete('/leads/:id/tags/:tagId', requireAuth, crmController.unassignTagFromLead);

// Tag routes
router.post('/tags', requireAuth, crmController.createTag);
router.get('/tags', requireAuth, crmController.getTags);
router.put('/tags/:id', requireAuth, crmController.updateTag);
router.delete('/tags/:id', requireAuth, crmController.deleteTag);

// Interaction routes
router.post('/interactions', requireAuth, uploadService.upload.single('file'), crmController.createInteraction);
router.get('/interactions', requireAuth, crmController.getInteractions);
router.get('/interactions/:id', requireAuth, crmController.getInteractionById);
router.put('/interactions/:id', requireAuth, uploadService.upload.single('file'), crmController.updateInteraction);
router.delete('/interactions/:id', requireAuth, crmController.deleteInteraction);

module.exports = router;
