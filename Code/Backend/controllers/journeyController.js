const Journey = require('../models/journey');

// 📌 Create a journey
exports.createJourney = async (req, res) => {
  try {
    const journey = new Journey(req.body);
    await journey.save();
    res.status(201).json(journey);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 📌 Get all journeys
exports.getJourneys = async (req, res) => {
  try {
    const journeys = await Journey.find()
      .populate({
        path: 'route',
        populate: [
          { path: 'originStop', model: 'BusStop' },
          { path: 'destinationStop', model: 'BusStop' },
          { path: 'stops.stop', model: 'BusStop' } // populate intermediate stops
        ]
      })
      .populate('vehicle')
      .populate('driver', 'firstName lastName email')
      .populate('currentStop');

    res.json(journeys);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Get single journey
exports.getJourneyById = async (req, res) => {
  try {
    const journey = await Journey.findById(req.params.id)
      .populate({
        path: 'route',
        populate: [
          { path: 'originStop', model: 'BusStop' },
          { path: 'destinationStop', model: 'BusStop' },
          { path: 'stops.stop', model: 'BusStop' }
        ]
      })
      .populate('vehicle')
      .populate('driver', 'firstName lastName email')
      .populate('currentStop');

    if (!journey) return res.status(404).json({ message: 'Journey not found' });
    res.json(journey);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Update journey
exports.updateJourney = async (req, res) => {
  try {
    const journey = await Journey.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!journey) return res.status(404).json({ message: 'Journey not found' });
    res.json(journey);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 📌 Delete journey
exports.deleteJourney = async (req, res) => {
  try {
    const journey = await Journey.findByIdAndDelete(req.params.id);
    if (!journey) return res.status(404).json({ message: 'Journey not found' });
    res.json({ message: 'Journey deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// 📌 Search journeys based on origin, destination, and date
exports.searchJourneys = async (req, res) => {
  const { origin, destination, date } = req.query;

  console.log('Journey search request received:', { origin, destination, date });

  try {
    // Validate required parameters
    if (!origin || !destination) {
      return res.status(400).json({ message: 'Origin and destination are required' });
    }

    const Route = require('../models/routes');
    const Journey = require('../models/journey');
    const BusStop = require('../models/busstop');
    const mongoose = require('mongoose');

    // Convert string IDs to ObjectIds if they're not already
    const originId = mongoose.Types.ObjectId.isValid(origin)
      ? new mongoose.Types.ObjectId(origin)
      : origin;
    const destinationId = mongoose.Types.ObjectId.isValid(destination)
      ? new mongoose.Types.ObjectId(destination)
      : destination;

    console.log('Searching for routes between:', { origin: originId, destination: destinationId });

    // Step 1: Look for direct routes
    let routes = await Route.find({
      originStop: originId,
      destinationStop: destinationId,
      isActive: true
    }).populate('originStop destinationStop');

    console.log(`Found ${routes.length} direct routes`);

    // Step 2: If no direct route, try indirect
    if (routes.length === 0) {
      console.log('Looking for indirect routes');
      routes = await Route.find({
        'stops.stop': { $all: [originId, destinationId] },
        isActive: true
      }).populate('originStop destinationStop stops.stop');

      console.log(`Found ${routes.length} potential indirect routes`);

      routes = routes.filter(route => {
        const stops = route.stops.map(s => s.stop._id.toString());
        const originIndex = stops.indexOf(origin);
        const destinationIndex = stops.indexOf(destination);
        return originIndex !== -1 && destinationIndex !== -1 && originIndex < destinationIndex;
      });

      console.log(`Filtered to ${routes.length} valid indirect routes`);
    }

    let journeys = [];
    if (routes.length > 0) {
      const routeIds = routes.map(route => route._id);

      // Handle date
      let searchDate = new Date();
      if (date) {
        searchDate = new Date(date);
        if (isNaN(searchDate.getTime())) {
          console.warn('Invalid date provided:', date);
          searchDate = new Date();
        }
      }
      searchDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);

      console.log('Searching for journeys on date:', {
        searchDate: searchDate.toISOString(),
        nextDay: nextDay.toISOString()
      });

      // Step 3: Get journeys
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

      console.log(`Found ${journeys.length} journeys for the routes on the specified date`);
    }

    // Step 4: Transform journeys
    const transformedJourneys = journeys.map(journey => {
      const originName = journey.route.originStop ? journey.route.originStop.name : 'Unknown';
      const destinationName = journey.route.destinationStop ? journey.route.destinationStop.name : 'Unknown';

      const price = calculateJourneyPrice(journey);
      const duration = calculateJourneyDuration(journey);

      return {
        _id: journey._id,
        departureTime: journey.date,
        route: {
          _id: journey.route._id,
          routeName: journey.route.routeName,
          routeCode: journey.route.routeCode
        },
        origin: originName,
        destination: destinationName,
        duration: duration,
        price: price,
        availableSeats: journey.totalSeats - journey.bookedSeats,
        status: journey.status
      };
    });

    // Step 5: If no journeys, generate dummy response
    if (transformedJourneys.length === 0) {
      console.log('No actual journeys found, generating dummy data');
      let originStopName = 'Unknown Origin';
      let destinationStopName = 'Unknown Destination';

      try {
        const [originStop, destinationStop] = await Promise.all([
          BusStop.findById(origin),
          BusStop.findById(destination)
        ]);
        if (originStop) originStopName = originStop.name;
        if (destinationStop) destinationStopName = destinationStop.name;
      } catch (err) {
        console.error('Error fetching bus stop names:', err);
      }

      // Dummy journeys
      const dummyJourney = {
        _id: 'dummy1',
        departureTime: new Date(),
        route: {
          _id: 'dummyRoute1',
          routeName: `${originStopName} - ${destinationStopName}`,
          routeCode: 'DUMMY001'
        },
        origin: originStopName,
        destination: destinationStopName,
        duration: '2h 30m',
        price: 250,
        availableSeats: 40,
        status: 'Scheduled'
      };

      return res.json([dummyJourney]);
    }

    // Step 6: Send success response
    return res.json(transformedJourneys);

  } catch (error) {
    console.error('Error in searchJourneys:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
