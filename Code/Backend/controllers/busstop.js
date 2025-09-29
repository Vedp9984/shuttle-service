const mongoose = require('mongoose');
const BusStop = require('../models/busstop');

/**
 * [C] CREATE: Add a new bus stop
 * POST /api/busstops
 */
exports.createBusStop = async (req, res) => {
    try {
        const { stopName, latitude, longitude } = req.body;
        if (!stopName || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ message: 'stopName, latitude, and longitude are required.' });
        }

        const newBusStop = new BusStop(req.body);
        const savedBusStop = await newBusStop.save();

        res.status(201).json(savedBusStop);
    } catch (error) {
        console.error('Error creating bus stop:', error);

        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                message: `A bus stop with this ${field} already exists.`,
                details: error.message
            });
        }

        res.status(400).json({ message: 'Error creating bus stop.', details: error.message });
    }
};

/**
 * [R] READ: Get all bus stops with optional search
 * GET /api/busstops?search=query
 */
exports.getAllBusStops = async (req, res) => {
    try {
        const { search } = req.query;
        let filter = {};

        if (search) {
            // Case-insensitive search on stopName using a regular expression
            const searchRegex = new RegExp(search, 'i');
            
            // Search by stopName OR by _id (if the query looks like a valid ObjectId)
            const orConditions = [
                { stopName: searchRegex }
            ];

            if (mongoose.Types.ObjectId.isValid(search)) {
                 orConditions.push({ _id: search });
            }

            filter = { $or: orConditions };
        }

        // Find all bus stops matching the filter, sorted by creation date
        const busStops = await BusStop.find(filter).sort({ createdAt: -1 });
        res.status(200).json(busStops);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bus stops.', details: error.message });
    }
};

/**
 * [U] UPDATE: Edit an existing bus stop
 * PUT /api/busstops/:id
 */
exports.updateBusStop = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Bus Stop ID format.' });
        }
        
        const updatedBusStop = await BusStop.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // {new: true} returns the updated document
        );

        if (!updatedBusStop) {
            return res.status(404).json({ message: 'Bus stop not found.' });
        }

        res.status(200).json(updatedBusStop);
    } catch (error) {
        res.status(400).json({ message: 'Error updating bus stop.', details: error.message });
    }
};

/**
 * [D] DELETE: Remove a bus stop
 * DELETE /api/busstops/:id
 */
exports.deleteBusStop = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Bus Stop ID format.' });
        }
        
        const deletedBusStop = await BusStop.findByIdAndDelete(req.params.id);

        if (!deletedBusStop) {
            return res.status(404).json({ message: 'Bus stop not found.' });
        }

        // NOTE: For a production app, you would add logic here to check if any Routes 
        // still reference this BusStop and either block the deletion or update those Routes.

        res.status(200).json({ message: 'Bus stop successfully deleted.', deletedBusStop });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting bus stop.', details: error.message });
    }
};

// GET a single bus stop by ID
// GET /api/busstops/:id
exports.getBusStopById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Bus Stop ID format.' });
        }

        const busStop = await BusStop.findById(req.params.id);
        if (!busStop) {
            return res.status(404).json({ message: 'Bus stop not found.' });
        }

        res.status(200).json(busStop);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bus stop.', details: error.message });
    }
};