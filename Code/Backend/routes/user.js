const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

// GET /api/user/:email
router.get('/:email', userController.getUserByEmail);

module.exports = router;
