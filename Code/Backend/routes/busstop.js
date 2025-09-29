const express = require('express');
const router = express.Router();
const busStopController = require('../controllers/busstop');

// Map CRUD operations to controller functions
router.post('/', busStopController.createBusStop);      // POST /api/busstops
router.get('/', busStopController.getAllBusStops);       // GET /api/busstops
router.put('/:id', busStopController.updateBusStop);     // PUT /api/busstops/:id
router.delete('/:id', busStopController.deleteBusStop);  // DELETE /api/busstops/:id

module.exports = router;
