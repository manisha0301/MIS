// backend/routes/biometricRoutes.js
const express = require('express');
const router = express.Router();
const biometricController = require('../controllers/biometricController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all biometric routes
router.use(authMiddleware);

router.get('/', biometricController.getAllBiometrics);
router.get('/:id', biometricController.getBiometricById);
router.post('/', biometricController.createBiometric);
router.put('/:id', biometricController.updateBiometric);
router.delete('/:id', biometricController.deleteBiometric);

module.exports = router;