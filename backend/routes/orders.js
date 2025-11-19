const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Customer routes
router.post('/', authenticateToken, requireRole(['student']), orderController.placeOrder);
router.get('/my-orders', authenticateToken, requireRole(['student']), orderController.getCustomerOrders);

// Vendor routes
router.get('/vendor/orders', 
    authenticateToken, 
    requireRole(['vendor']), 
    orderController.getVendorOrders  // ADD THIS METHOD TO orderController
);

router.patch('/:order_id/status', authenticateToken, requireRole(['vendor']), orderController.updateOrderStatus);

// General routes
router.get('/:order_id', authenticateToken, orderController.getOrderDetails);

module.exports = router;