const Vehicle = require('../models/vehicle');

// 📌 Create a vehicle
exports.createVehicle = async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 📌 Get all vehicles
exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Get single vehicle
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//get vehicle by plate number
exports.getVehicleByPlateNumber = async (req, res) => {
  try {
    const { plateNumber } = req.query;
    if (!plateNumber) {
      return res.status(400).json({ message: 'Plate number is required' });
    }
    const vehicle = await Vehicle.findOne({ plateNumber: plateNumber });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Update vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 📌 Delete vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.searchVehicles = async (req, res) => {
  try {
    const { value } = req.query;

    if (!value) {
      return res.status(400).json({ message: 'Search value is required' });
    }

    const query = {
      $or: [
        { plateNumber: new RegExp(value, 'i') },
        { model: new RegExp(value, 'i') },
        { manufacturer: new RegExp(value, 'i') },
        { 'owner.name': new RegExp(value, 'i') },
        { vin: new RegExp(value, 'i') },
      ]
    };

    const vehicles = await Vehicle.find(query);
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
