const express = require('express');
const router = express.Router();
const facilityController = require('../controllers/facilityController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', facilityController.getAllFacilities);
router.get('/my-facilities', verifyToken, facilityController.getMyFacilities);
router.get('/:id', facilityController.getFacilityById);

router.post('/', verifyToken, facilityController.createFacility);
router.put('/:id', verifyToken, facilityController.updateFacility);
router.patch('/:id', verifyToken, facilityController.updateFacility);
router.delete('/:id', verifyToken, facilityController.deleteFacility);

module.exports = router;
