const express = require('express');
const supportController = require('../controllers/supportController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Customer routes
router.post('/tickets', authenticateToken, requireRole(['student']), supportController.createTicket);
router.get('/tickets/my-tickets', authenticateToken, requireRole(['student']), supportController.getUserTickets);
router.get('/tickets/:ticket_id/messages', authenticateToken, supportController.getTicketMessages);
router.post('/tickets/:ticket_id/messages', authenticateToken, supportController.sendMessage);

// Support agent routes
router.get('/tickets', authenticateToken, requireRole(['support_agent', 'senior_support', 'admin']), supportController.getAllTickets);

// Vendor routes (read-only complaints)
router.get('/complaints/restaurant', authenticateToken, requireRole(['vendor']), supportController.getRestaurantComplaints);

module.exports = router;
