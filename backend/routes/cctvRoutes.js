// backend/routes/cctvRoutes.js
const express = require('express');
const router = express.Router();
const cctvController = require('../controllers/cctvController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all CCTV routes
router.use(authMiddleware);

router.get('/', cctvController.getAllCctvs);
router.get('/:id', cctvController.getCctvById);
router.post('/', cctvController.createCctv);
router.put('/:id', cctvController.updateCctv);
router.delete('/:id', cctvController.deleteCctv);

module.exports = router;