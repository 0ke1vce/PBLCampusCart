const express = require('express');
const restaurantController = require('../controllers/restaurantController');
const orderController = require('../controllers/orderController'); // ADD THIS
const inventoryController = require('../controllers/inventoryController'); // ADD THIS
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', restaurantController.getAllRestaurants);
router.get('/outlet/:outlet_type', restaurantController.getRestaurantsByOutlet);
router.get('/stats', restaurantController.getOutletStats);
router.get('/:id', restaurantController.getRestaurantById);

// Vendor routes
router.get('/vendor/my-restaurants', 
    authenticateToken, 
    requireRole(['vendor']), 
    restaurantController.getVendorRestaurants  // Use the restaurantController method
);

router.patch('/:restaurant_id/status', 
    authenticateToken, 
    requireRole(['vendor']), 
    restaurantController.updateRestaurantStatus
);

module.exports = router;