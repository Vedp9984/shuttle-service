const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

// Specific route must come first
router.get('/by-plate-number', vehicleController.getVehicleByPlateNumber);

// Generic route by ID
router.get('/:id', vehicleController.getVehicleById);
router.get('/', vehicleController.getVehicles);
// Other routes
router.post('/', vehicleController.createVehicle);
router.put('/:id', vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);

module.exports = router;
