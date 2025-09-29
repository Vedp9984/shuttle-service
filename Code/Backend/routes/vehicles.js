const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

// CRUD endpoints
router.post('/', vehicleController.createVehicle);
router.get('/', vehicleController.getVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.put('/:id', vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);

module.exports = router;
