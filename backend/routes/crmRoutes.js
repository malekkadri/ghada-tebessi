const express = require('express');
const router = express.Router();
const crmController = require('../controllers/crmController');
const { requireAuth } = require('../middleware/authMiddleware');

// Customer routes
router.post('/customers', requireAuth, crmController.createCustomer);
router.get('/customers', requireAuth, crmController.getCustomers);
router.get('/customers/:id', requireAuth, crmController.getCustomerById);
router.put('/customers/:id', requireAuth, crmController.updateCustomer);
router.delete('/customers/:id', requireAuth, crmController.deleteCustomer);
router.get('/customers/:id/interactions', requireAuth, crmController.getInteractionsByCustomer);
router.post('/customers/:id/interactions', requireAuth, crmController.createInteractionForCustomer);
router.post('/customers/:id/tags/:tagId', requireAuth, crmController.assignTagToCustomer);
router.delete('/customers/:id/tags/:tagId', requireAuth, crmController.unassignTagFromCustomer);

// Lead routes
router.post('/leads', requireAuth, crmController.createLead);
router.get('/leads', requireAuth, crmController.getLeads);
router.get('/leads/:id', requireAuth, crmController.getLeadById);
router.put('/leads/:id', requireAuth, crmController.updateLead);
router.delete('/leads/:id', requireAuth, crmController.deleteLead);
router.get('/leads/:id/interactions', requireAuth, crmController.getInteractionsByLead);
router.post('/leads/:id/interactions', requireAuth, crmController.createInteractionForLead);
router.post('/leads/:id/tags/:tagId', requireAuth, crmController.assignTagToLead);
router.delete('/leads/:id/tags/:tagId', requireAuth, crmController.unassignTagFromLead);

// Tag routes
router.post('/tags', requireAuth, crmController.createTag);
router.get('/tags', requireAuth, crmController.getTags);
router.put('/tags/:id', requireAuth, crmController.updateTag);
router.delete('/tags/:id', requireAuth, crmController.deleteTag);

// Interaction routes
router.post('/interactions', requireAuth, crmController.createInteraction);
router.get('/interactions', requireAuth, crmController.getInteractions);
router.get('/interactions/:id', requireAuth, crmController.getInteractionById);
router.put('/interactions/:id', requireAuth, crmController.updateInteraction);
router.delete('/interactions/:id', requireAuth, crmController.deleteInteraction);

module.exports = router;
