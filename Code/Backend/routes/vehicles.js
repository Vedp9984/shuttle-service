const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController'); // ✅ ensure correct file name

// 📌 Custom search (must be first)
router.get('/search/query', vehicleController.searchVehicles);

// 📌 Get vehicle by plate number
router.get('/by-plate-number', vehicleController.getVehicleByPlateNumber);

// 📌 Get all vehicles
router.get('/', vehicleController.getVehicles);

// 📌 Get vehicle by ID
router.get('/:id', vehicleController.getVehicleById);

// 📌 Create a new vehicle
router.post('/', vehicleController.createVehicle);

// 📌 Update a vehicle
router.put('/:id', vehicleController.updateVehicle);

// 📌 Delete a vehicle
router.delete('/:id', vehicleController.deleteVehicle);

module.exports = router;
