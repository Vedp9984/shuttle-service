const express = require('express');
const router = express.Router();
const routesController = require('../controllers/routes');

router.post('/', routesController.createRoute);      
router.get('/', routesController.searchRoutes); // GET /api/routes?search=<query>

// GET route ID by code (specific first)
router.get('/code/:code', routesController.getRouteIdByCode);

// GET route by MongoDB ID (generic)
router.get('/:id', routesController.getRouteById);


router.put('/:id', routesController.updateRoute);    
router.delete('/:id', routesController.deleteRoute);  

module.exports = router;
