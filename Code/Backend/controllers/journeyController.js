// --- START OF FILE journeyController.js (FINAL, FIXED) ---
const mongoose = require('mongoose');
const Journey = require('../models/journey');
const Route = require('../models/routes');
const BusStop = require('../models/busstop');

// ----------------------
// 🔧 Helper functions
// ----------------------

// 💰 Calculate price based on total seats or other logic
const calculateJourneyPrice = (journey) => {
  const baseFare = 50;
  const perHourRate = 30;
  const durationText = calculateJourneyDuration(journey);

  // Extract number of hours from duration string (e.g. "2h 30m" → 2)
  const hours = parseInt(durationText.split('h')[0]) || 1;

  return baseFare + perHourRate * hours;
};

// ⏱️ Calculate human-friendly duration string
const calculateJourneyDuration = (journey) => {
  if (!journey) return 'N/A';

  const start = journey.originDepartureTime || journey.route?.originDepartureTime;
  const end = journey.destinationArrivalTime || journey.route?.destinationArrivalTime;

  if (!start || !end) return 'N/A';

  try {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    let startTotal = startH * 60 + startM;
    let endTotal = endH * 60 + endM;

    // Handle midnight rollover
    if (endTotal < startTotal) endTotal += 24 * 60;

    const diff = endTotal - startTotal;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  } catch (err) {
    console.error('Error calculating duration:', err);
    return 'N/A';
  }
};

// ----------------------
// 📍 CRUD OPERATIONS
// ----------------------

// 📌 Create a new journey
exports.createJourney = async (req, res) => {
  try {
    const journey = new Journey(req.body);
    await journey.save();
    res.status(201).json(journey);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 📌 Get all journeys (for dashboard)
exports.getJourneys = async (req, res) => {
  try {
    const now = new Date();

    const journeys = await Journey.find({
      date: { $gte: now },
      status: { $in: ['Scheduled', 'Ongoing'] }
    })
      .limit(5)
      .sort({ date: 1 })
      .populate({
        path: 'route',
        select: 'routeName routeCode originStop destinationStop',
        populate: [
          { path: 'originStop', select: 'stopName' },
          { path: 'destinationStop', select: 'stopName' }
        ]
      })
      .populate('vehicle', 'plateNumber model');

    res.json(journeys);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Get a single journey by ID
exports.getJourneyById = async (req, res) => {
  try {
    const journey = await Journey.findById(req.params.id)
      .populate('route', 'routeName routeCode')
      .populate('vehicle', 'plateNumber model')
      .populate('driver', 'name email')
      .populate('currentStop', 'stopName location');

    if (!journey) return res.status(404).json({ message: 'Journey not found' });
    res.json(journey);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Update a journey
exports.updateJourney = async (req, res) => {
  try {
    const journey = await Journey.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!journey) return res.status(404).json({ message: 'Journey not found' });
    res.json(journey);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 📌 Delete a journey
exports.deleteJourney = async (req, res) => {
  try {
    const journey = await Journey.findByIdAndDelete(req.params.id);
    if (!journey) return res.status(404).json({ message: 'Journey not found' });
    res.json({ message: 'Journey deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Get journeys by user
exports.getJourneysByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const journeys = await Journey.find({ userId })
      .sort({ date: -1 })
      .populate('route', 'routeName routeCode');
    res.json(journeys);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------
// 🔎 Search Journeys by origin/destination/date
// ----------------------
exports.searchJourneys = async (req, res) => {
  const { origin, destination, date } = req.query;

  try {
    if (!origin || !destination || !date) {
      return res.status(400).json({ message: 'Origin, destination, and date are required' });
    }

    // Convert string IDs to ObjectIds
    const originId = mongoose.Types.ObjectId.isValid(origin) ? new mongoose.Types.ObjectId(origin) : null;
    const destinationId = mongoose.Types.ObjectId.isValid(destination) ? new mongoose.Types.ObjectId(destination) : null;

    if (!originId || !destinationId) {
      return res.status(400).json({ message: 'Invalid Origin or Destination Stop ID format.' });
    }

    // --- Step 1: Find routes containing both stops ---
    let routes = await Route.find({
      $and: [
        { $or: [{ originStop: originId }, { destinationStop: originId }, { 'stops.stop': originId }] },
        { $or: [{ originStop: destinationId }, { destinationStop: destinationId }, { 'stops.stop': destinationId }] }
      ],
      isActive: true
    })
      .populate('stops.stop')
      .populate('originStop')
      .populate('destinationStop')
      .select('_id routeName routeCode originStop destinationStop stops originDepartureTime destinationArrivalTime');

    // Step 2: Ensure correct stop order
    routes = routes.filter(route => {
      const allStops = [
        route.originStop?._id?.toString(),
        ...route.stops.map(s => s.stop?._id?.toString()),
        route.destinationStop?._id?.toString()
      ].filter(Boolean);

      const originIndex = allStops.indexOf(origin);
      const destinationIndex = allStops.indexOf(destination);

      return originIndex !== -1 && destinationIndex !== -1 && originIndex < destinationIndex;
    });

    // Step 3: Fetch matching journeys
    let journeys = [];
    if (routes.length > 0) {
      const routeIds = routes.map(r => r._id);
      const searchDate = new Date(date);
      searchDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);

      journeys = await Journey.find({
        route: { $in: routeIds },
        date: { $gte: searchDate, $lt: nextDay },
        status: { $nin: ['Cancelled'] }
      }).populate({
        path: 'route',
        populate: [
          { path: 'originStop', model: 'BusStop' },
          { path: 'destinationStop', model: 'BusStop' }
        ]
      });
    }

    // Step 4: Build transformed response
    const transformedJourneys = journeys.map(journey => {
      const route = journey.route;

      const originName = route?.originStop?.stopName || 'Unknown';
      const destinationName = route?.destinationStop?.stopName || 'Unknown';

      // ✅ Properly combine date + time
      const journeyDateTime = new Date(journey.date);
      const [depHour, depMin] = (journey.originDepartureTime || route.originDepartureTime || '00:00')
        .split(':')
        .map(Number);
      journeyDateTime.setHours(depHour, depMin, 0, 0);

      const arrivalDateTime = new Date(journey.date);
      const [arrHour, arrMin] = (journey.destinationArrivalTime || route.destinationArrivalTime || '00:00')
        .split(':')
        .map(Number);
      arrivalDateTime.setHours(arrHour, arrMin, 0, 0);
      if (arrivalDateTime < journeyDateTime) arrivalDateTime.setDate(arrivalDateTime.getDate() + 1);

      const duration = calculateJourneyDuration({
        originDepartureTime: `${depHour}:${depMin.toString().padStart(2, '0')}`,
        destinationArrivalTime: `${arrHour}:${arrMin.toString().padStart(2, '0')}`
      });
      const price = calculateJourneyPrice(journey);

      return {
        _id: journey._id,
        departureTime: journeyDateTime,
        arrivalTime: arrivalDateTime,
        route: {
          _id: route._id,
          routeName: route.routeName,
          routeCode: route.routeCode
        },
        origin: originName,
        destination: destinationName,
        duration,
        price,
        availableSeats: journey.totalSeats - journey.bookedSeats,
        totalSeats: journey.totalSeats,
        bookedSeats: journey.bookedSeats,
        status: journey.status
      };
    }).sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));

    return res.json(transformedJourneys);
  } catch (error) {
    console.error('Error in searchJourneys:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// --- START OF FILE controllers/journeyController.js (DRIVER LOGIC INSERT) ---

// ----------------------
// 🧑‍✈️ DRIVER OPERATIONS
// ----------------------

// 📌 Get journeys assigned to a specific driver (Used by DriverDashboard.jsx)
exports.getDriverJourneys = async (req, res) => {
    try {
        // --- FIX: Get driverId from query parameters (Non-RBAC setup) ---
        const driverId = req.query.driverId; 
        const { type } = req.query; // e.g., 'past', 'upcoming', 'current'

        if (!driverId) {
            return res.status(400).json({ message: 'Driver ID is required.' });
        }

        let dateFilter = {};
        const now = new Date();
        const startOfToday = new Date(now).setHours(0, 0, 0, 0);
        const endOfToday = new Date(now).setHours(23, 59, 59, 999);
        const tomorrow = new Date(startOfToday);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (type === 'past') {
            dateFilter = { date: { $lt: startOfToday } };
        } else if (type === 'upcoming') {
            dateFilter = { date: { $gte: tomorrow } };
        } else if (type === 'current') {
            dateFilter = { 
                date: { $gte: startOfToday, $lte: endOfToday },
                status: { $in: ['Scheduled', 'Ongoing'] }
            };
        } else {
            // Default to upcoming + current for simplicity if type is missing/unknown
            dateFilter = { date: { $gte: startOfToday } };
        }

        const journeys = await Journey.find({ driver: driverId, ...dateFilter })
            .populate({
                path: 'route',
                select: 'routeName routeCode originStop destinationStop',
                populate: [
                    { path: 'originStop', select: 'stopName' }, 
                    { path: 'destinationStop', select: 'stopName' } 
                ]
            })
            .populate('vehicle', 'plateNumber model totalSeats')
            .populate('currentStop', 'stopName')
            .sort({ date: type === 'past' ? -1 : 1 });

        res.json(journeys);
    } catch (err) {
        console.error('Error fetching driver journeys:', err);
        res.status(500).json({ message: 'Server error fetching driver journeys.', error: err.message });
    }
};

// 📌 Driver updates Journey Status/Location
exports.updateJourneyStatus = async (req, res) => {
    try {
        const { status, currentStop, delayMinutes, driverId } = req.body;
        const journey = await Journey.findById(req.params.id);

        if (!journey) {
            return res.status(404).json({ message: 'Journey not found' });
        }
        
        // --- SECURITY/CONSISTENCY CHECK: Ensure the driver is allowed to update ---
        // (Though non-RBAC, this prevents any user from updating any trip)
        if (journey.driver.toString() !== driverId) { 
            return res.status(403).json({ message: 'Not authorized to update this journey. Driver ID mismatch.' });
        }

        // Apply updates
        if (status) journey.status = status;
        if (currentStop) journey.currentStop = currentStop;
        if (delayMinutes !== undefined) journey.delayMinutes = delayMinutes;
        
        const updatedJourney = await journey.save();

        res.json(updatedJourney);
    } catch (err) {
        console.error('Update journey status error:', err);
        res.status(400).json({ message: 'Error updating journey status.', error: err.message });
    }
};

// --- END OF FILE controllers/journeyController.js (DRIVER LOGIC INSERT) ---
// --- END OF FILE journeyController.js ---
