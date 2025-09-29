const mongoose = require('mongoose');
const Route = require('../models/routes');
const BusStop = require('../models/busstop');

// Helper to validate all stop IDs
const validateStopsExist = async (originStop, destinationStop, stops) => {
    // Check origin and destination
    const idsToCheck = [originStop, destinationStop, ...stops.map(s => s.stop)];
    
    for (let id of idsToCheck) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error(`Invalid Bus Stop ID format: ${id}`);
        }
        const exists = await BusStop.findById(id);
        if (!exists) {
            throw new Error(`Bus stop not found for ID: ${id}`);
        }
    }
};

// CREATE a new route
exports.createRoute = async (req, res) => {
    try {
        const {
            originStop,
            destinationStop,
            stops,
            routeCode,
            routeName,
            description,
            daysAvailable,
            defaultDepartureTime,
            originDepartureTime,
            destinationArrivalTime
        } = req.body;

        // Check if a route with the same code already exists
        const existingRoute = await Route.findOne({ routeCode: routeCode.toUpperCase() });
        if (existingRoute) {
            return res.status(400).json({ message: `Route code '${routeCode}' already exists.` });
        }

        // Validate that the stops exist
        await validateStopsExist(originStop, destinationStop, stops || []);

        // Create the new route
        const newRoute = new Route({
            routeCode: routeCode.toUpperCase(), // ensure uppercase consistency
            routeName,
            description,
            originStop,
            originDepartureTime,
            destinationStop,
            destinationArrivalTime,
            stops,
            daysAvailable,
            defaultDepartureTime
        });

        const savedRoute = await newRoute.save();
        res.status(201).json(savedRoute);

    } catch (error) {
        res.status(400).json({ message: 'Error creating route', details: error.message });
    }
};




// GET a single route by ID
exports.getRouteById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Route ID.' });
        }

        const route = await Route.findById(id)
            .populate('originStop')
            .populate('destinationStop')
            .populate('stops.stop');

        if (!route) {
            return res.status(404).json({ message: 'Route not found.' });
        }

        res.status(200).json(route);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching route.', details: error.message });
    }
};


// UPDATE a route by ID (full overwrite)
exports.updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Route ID.' });
    }

    const route = await Route.findById(id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found.' });
    }

    const {
      routeCode, routeName, description, isActive,
      originStop, originDepartureTime, destinationStop, destinationArrivalTime,
      stops, daysAvailable, defaultDepartureTime
    } = req.body;

    // Validate stops exist
    await validateStopsExist(originStop, destinationStop, stops);

    // Overwrite all fields
    route.routeCode = routeCode;
    route.routeName = routeName;
    route.description = description;
    route.isActive = isActive !== undefined ? isActive : route.isActive;
    route.originStop = originStop;
    route.originDepartureTime = originDepartureTime;
    route.destinationStop = destinationStop;
    route.destinationArrivalTime = destinationArrivalTime;
    route.stops = stops; // full array
    route.daysAvailable = daysAvailable;
    route.defaultDepartureTime = defaultDepartureTime;

    await route.save();

    // Populate references
    await route.populate('originStop destinationStop stops.stop');

    res.status(200).json(route);

  } catch (error) {
    res.status(400).json({ message: 'Error updating route', details: error.message });
  }
};


// DELETE a route by ID
exports.deleteRoute = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Route ID.' });
        }

        const deletedRoute = await Route.findByIdAndDelete(id);
        if (!deletedRoute) {
            return res.status(404).json({ message: 'Route not found.' });
        }

        res.status(200).json({ message: 'Route deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting route.', details: error.message });
    }
};

/**
 * GET /api/routes?search=<query>
 * Supports partial name search or exact ID match
 */
exports.searchRoutes = async (req, res) => {
    try {
        const { search } = req.query;
        let filter = {};

        if (search) {
            const searchRegex = new RegExp(search, 'i'); // case-insensitive

            const orConditions = [
                { routeName: searchRegex }
            ];

            if (mongoose.Types.ObjectId.isValid(search)) {
                orConditions.push({ _id: search });
            }

            filter = { $or: orConditions };
        }

        const routes = await Route.find(filter)
            .populate('originStop')
            .populate('destinationStop')
            .populate('stops.stop')
            .sort({ createdAt: -1 });

        res.status(200).json(routes);
    } catch (error) {
        res.status(500).json({ message: 'Error searching routes.', details: error.message });
    }
};
