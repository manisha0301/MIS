// backend/routes/cugRoutes.js
const express = require('express');
const router = express.Router();
const cugController = require('../controllers/cugController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all CUG routes
router.use(authMiddleware);

router.get('/', cugController.getAllCugs);
router.get('/:id', cugController.getCugById);
router.post('/', cugController.createCug);
router.put('/:id', cugController.updateCug);
router.delete('/:id', cugController.deleteCug);

module.exports = router;