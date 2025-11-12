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

// GET a route ID by code
exports.getRouteIdByCode = async (req, res) => {
    try {
        const { code } = req.params;

        if (!code) {
            return res.status(400).json({ message: 'Route code is required.' });
        }

        const route = await Route.findOne({ routeCode: code }).select('_id');

        if (!route) {
            return res.status(404).json({ message: 'Route not found.' });
        }

        res.status(200).json({ id: route._id });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching route ID.', details: error.message });
    }
};



// GET a single route by ID
exports.getRouteById = async (req, res) => {
    try {
        const route = await Route.findById(req.params.id)
            .populate({
                path: 'originStop',
                model: 'BusStop',
                select: 'name location description'
            })
            .populate({
                path: 'destinationStop', 
                model: 'BusStop',
                select: 'name location description'
            })
            .populate({
                path: 'stops.stop',
                model: 'BusStop',
                select: 'name location description'
            });
        
        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }
        
        res.json(route);
    } catch (err) {
        console.error('Error in getRouteById:', err);
        res.status(500).json({ message: err.message });
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
        let query = {};
        
        // Handle search parameter if provided
        if (req.query.search) {
            const searchTerm = req.query.search;
            query = {
                $or: [
                    { routeName: { $regex: searchTerm, $options: 'i' } },
                    { routeCode: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } }
                ]
            };
        }
        
        // Fix the population to ensure we get the full documents
        const routes = await Route.find(query)
            .populate({
                path: 'originStop',
                model: 'BusStop',
                select: 'name location description'
            })
            .populate({
                path: 'destinationStop',
                model: 'BusStop',
                select: 'name location description'
            })
            .populate({
                path: 'stops.stop',
                model: 'BusStop',
                select: 'name location description'
            });
        
        // Debug logging to see if population worked
        if (routes.length > 0) {
            console.log('First route details:');
            console.log('Route name:', routes[0].routeName);
            console.log('Origin stop:', routes[0].originStop);
            console.log('Destination stop:', routes[0].destinationStop);
        } else {
            console.log('No routes found');
        }
        
        res.json(routes);
    } catch (err) {
        console.error('Error in searchRoutes:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.getRouteByCode = async (req, res) => {
  try {
    const route = await Route.findOne({ routeCode: req.params.code })
      .populate('originStop destinationStop stops.stop');
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json(route);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
