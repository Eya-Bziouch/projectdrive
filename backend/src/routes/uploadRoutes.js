const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const authenticate = require('../middlewares/authenticate'); // Ensure auth

// Single file upload route
router.post('/', authenticate, uploadController.upload.single('file'), uploadController.uploadFile);

module.exports = router;
