// backend/routes/alcatelRoutes.js
const express = require('express');
const router = express.Router();
const alcatelController = require('../controllers/alcatelController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all Alcatel routes
router.use(authMiddleware);

router.get('/', alcatelController.getAllAlcatels);
router.get('/:id', alcatelController.getAlcatelById);
router.post('/', alcatelController.createAlcatel);
router.put('/:id', alcatelController.updateAlcatel);
router.delete('/:id', alcatelController.deleteAlcatel);

module.exports = router;