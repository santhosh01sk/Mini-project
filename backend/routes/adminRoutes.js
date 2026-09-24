const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/users-overview', adminController.getUsersOverview);
router.get('/logs', adminController.getSystemLogs);
router.post('/query', adminController.handleQuery);

module.exports = router;