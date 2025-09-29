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
      .populate('route')
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
      .populate('route')
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
