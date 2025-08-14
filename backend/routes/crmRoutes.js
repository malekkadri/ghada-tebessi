const express = require('express');
const router = express.Router();
const crmController = require('../controllers/crmController');

// Customer routes
router.post('/customers', crmController.createCustomer);
router.get('/customers', crmController.getCustomers);
router.get('/customers/:id', crmController.getCustomerById);
router.put('/customers/:id', crmController.updateCustomer);
router.delete('/customers/:id', crmController.deleteCustomer);

// Lead routes
router.post('/leads', crmController.createLead);
router.get('/leads', crmController.getLeads);
router.get('/leads/:id', crmController.getLeadById);
router.put('/leads/:id', crmController.updateLead);
router.delete('/leads/:id', crmController.deleteLead);

// Interaction routes
router.post('/interactions', crmController.createInteraction);
router.get('/interactions', crmController.getInteractions);
router.get('/interactions/:id', crmController.getInteractionById);
router.put('/interactions/:id', crmController.updateInteraction);
router.delete('/interactions/:id', crmController.deleteInteraction);

module.exports = router;
