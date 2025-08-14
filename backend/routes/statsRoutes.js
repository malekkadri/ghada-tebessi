const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { requireAuthSuperAdmin, requireSuperAdmin } = require('../middleware/authMiddleware');

router.get('/superadmin/stats', requireAuthSuperAdmin, requireSuperAdmin, statsController.getStats);

module.exports = router;

