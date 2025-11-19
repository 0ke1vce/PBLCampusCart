const { pool } = require('../config/database');
const aiService = require('../services/aiService');

const supportController = {
    // Create new support ticket
    createTicket: async (req, res) => {
        try {
            const userId = req.user.user_id;
            const { order_id, restaurant_id, ticket_type, subject, description, priority } = req.body;

            console.log('📋 Creating support ticket:', { userId, ticket_type, subject });

            // Validate required fields
            if (!ticket_type || !subject || !description) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const [result] = await pool.execute(
                `INSERT INTO support_tickets (user_id, order_id, restaurant_id, ticket_type, subject, description, priority)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, order_id || null, restaurant_id || null, ticket_type, subject, description, priority || 'medium']
            );

            const ticketId = result.insertId;

            // Add initial customer message
            await pool.execute(
                `INSERT INTO chat_messages (ticket_id, sender_id, sender_type, message_text)
                 VALUES (?, ?, 'customer', ?)`,
                [ticketId, userId, description]
            );

            // Get AI bot response
            const aiResponse = await aiService.generateResponse(description, ticket_type);
            
            await pool.execute(
                `INSERT INTO chat_messages (ticket_id, sender_id, sender_type, message_text, is_ai_generated, ai_confidence_score)
                 VALUES (?, NULL, 'ai_bot', ?, TRUE, ?)`,
                [ticketId, aiResponse.message, aiResponse.confidence]
            );

            // Log AI interaction
            await pool.execute(
                `INSERT INTO ai_bot_logs (ticket_id, user_query, ai_response, intent_detected, confidence_score, escalated_to_human)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [ticketId, description, aiResponse.message, aiResponse.intent, aiResponse.confidence, aiResponse.needsHuman]
            );

            // Auto-escalate if needed
            if (aiResponse.needsHuman || priority === 'urgent') {
                await supportController.escalateToHuman(ticketId, 'Auto-escalation: ' + (aiResponse.needsHuman ? 'AI confidence low' : 'Urgent priority'));
            }

            // If this ticket is related to a restaurant, create a restaurant_complaints entry
            try {
                let effectiveRestaurantId = restaurant_id;

                // If restaurant_id not provided but order_id exists, try to infer restaurant_id from the order
                if (!effectiveRestaurantId && order_id) {
                    try {
                        const [orders] = await pool.execute(
                            'SELECT restaurant_id FROM orders WHERE order_id = ? LIMIT 1',
                            [order_id]
                        );
                        if (orders.length > 0) {
                            effectiveRestaurantId = orders[0].restaurant_id;
                            console.log('🔎 Inferred restaurant_id from order:', effectiveRestaurantId);
                        }
                    } catch (inferErr) {
                        console.error('❌ Failed to infer restaurant_id from order:', inferErr.message);
                    }
                }

                if (effectiveRestaurantId) {
                    await pool.execute(
                        `INSERT INTO restaurant_complaints (ticket_id, restaurant_id, complaint_type, complaint_summary)
                         VALUES (?, ?, ?, ?)`,
                        [ticketId, effectiveRestaurantId, ticket_type, subject || description || null]
                    );
                    console.log('📣 Restaurant complaint recorded for restaurant:', effectiveRestaurantId, 'ticket:', ticketId);
                } else {
                    console.log('ℹ️ No restaurant association for ticket', ticketId, '— skipping restaurant_complaints insert');
                }
            } catch (rcErr) {
                console.error('❌ Failed to create restaurant_complaints entry:', rcErr.message);
                // don't fail the ticket creation if this secondary insert fails
            }

            console.log('✅ Ticket created:', ticketId);

            res.status(201).json({
                message: 'Support ticket created successfully',
                ticket_id: ticketId,
                ai_response: aiResponse.message,
                escalated: aiResponse.needsHuman,
                status: 'open'
            });

        } catch (error) {
            console.error('❌ Create ticket error:', error);
            res.status(500).json({ 
                error: 'Failed to create support ticket',
                details: error.message 
            });
        }
    },

    // Get user's tickets
    getUserTickets: async (req, res) => {
        try {
            const userId = req.user.user_id;

            const [tickets] = await pool.execute(
                `SELECT 
                    st.*,
                    r.restaurant_name,
                    o.order_id,
                    agent.full_name as assigned_agent_name
                FROM support_tickets st
                LEFT JOIN restaurants r ON st.restaurant_id = r.restaurant_id
                LEFT JOIN orders o ON st.order_id = o.order_id
                LEFT JOIN users agent ON st.assigned_to = agent.user_id
                WHERE st.user_id = ?
                ORDER BY st.created_at DESC`,
                [userId]
            );

            res.json({ tickets });

        } catch (error) {
            console.error('❌ Get user tickets error:', error);
            res.status(500).json({ error: 'Failed to get tickets' });
        }
    },

    // Get ticket messages
    getTicketMessages: async (req, res) => {
        try {
            const { ticket_id } = req.params;
            const userId = req.user.user_id;
            const userType = req.user.user_type;

            // Verify access for students
            if (userType === 'student') {
                const [tickets] = await pool.execute(
                    'SELECT ticket_id FROM support_tickets WHERE ticket_id = ? AND user_id = ?',
                    [ticket_id, userId]
                );
                if (tickets.length === 0) {
                    return res.status(403).json({ error: 'Access denied' });
                }
            }

            const [messages] = await pool.execute(
                `SELECT 
                    cm.*,
                    u.full_name as sender_name,
                    u.user_type as sender_role
                FROM chat_messages cm
                LEFT JOIN users u ON cm.sender_id = u.user_id
                WHERE cm.ticket_id = ? 
                  AND (cm.is_internal_note = FALSE OR ? IN ('support_agent', 'senior_support', 'admin'))
                ORDER BY cm.created_at ASC`,
                [ticket_id, userType]
            );

            res.json({ messages });

        } catch (error) {
            console.error('❌ Get messages error:', error);
            res.status(500).json({ error: 'Failed to get messages' });
        }
    },

    // Send message in ticket
    sendMessage: async (req, res) => {
        try {
            const { ticket_id } = req.params;
            const { message_text, is_internal_note } = req.body;
            const userId = req.user.user_id;
            const userType = req.user.user_type;

            if (!message_text || !message_text.trim()) {
                return res.status(400).json({ error: 'Message text is required' });
            }

            const senderTypeMap = {
                student: 'customer',
                support_agent: 'support_agent',
                senior_support: 'senior_support',
                admin: 'senior_support'
            };

            const senderType = senderTypeMap[userType] || 'customer';

            const [result] = await pool.execute(
                `INSERT INTO chat_messages (ticket_id, sender_id, sender_type, message_text, is_internal_note)
                 VALUES (?, ?, ?, ?, ?)`,
                [ticket_id, userId, senderType, message_text, is_internal_note || false]
            );

            await pool.execute(
                `UPDATE support_tickets 
                 SET updated_at = CURRENT_TIMESTAMP,
                     status = CASE 
                         WHEN status = 'open' AND ? IN ('support_agent', 'senior_support') THEN 'in_progress'
                         ELSE status 
                     END
                 WHERE ticket_id = ?`,
                [userType, ticket_id]
            );

            // If customer message and no agent assigned, get AI response
            if (userType === 'student') {
                const [ticket] = await pool.execute(
                    'SELECT assigned_to, ticket_type FROM support_tickets WHERE ticket_id = ?',
                    [ticket_id]
                );

                if (ticket.length > 0 && !ticket[0].assigned_to) {
                    const aiResponse = await aiService.generateResponse(message_text, ticket[0].ticket_type);
                    
                    await pool.execute(
                        `INSERT INTO chat_messages (ticket_id, sender_id, sender_type, message_text, is_ai_generated, ai_confidence_score)
                         VALUES (?, NULL, 'ai_bot', ?, TRUE, ?)`,
                        [ticket_id, aiResponse.message, aiResponse.confidence]
                    );

                    await pool.execute(
                        `INSERT INTO ai_bot_logs (ticket_id, user_query, ai_response, intent_detected, confidence_score, escalated_to_human)
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [ticket_id, message_text, aiResponse.message, aiResponse.intent, aiResponse.confidence, aiResponse.needsHuman]
                    );

                    if (aiResponse.needsHuman) {
                        await supportController.escalateToHuman(ticket_id, 'AI escalation recommended');
                    }
                }
            }

            res.status(201).json({
                message: 'Message sent successfully',
                message_id: result.insertId
            });

        } catch (error) {
            console.error('❌ Send message error:', error);
            res.status(500).json({ error: 'Failed to send message' });
        }
    },

    // Escalate to human support
    escalateToHuman: async (ticketId, reason) => {
        try {
            const [agents] = await pool.execute(
                `SELECT u.user_id, COUNT(st.ticket_id) as active_tickets
                 FROM users u
                 LEFT JOIN support_tickets st ON u.user_id = st.assigned_to 
                    AND st.status IN ('assigned', 'in_progress')
                 WHERE u.user_type = 'support_agent' AND u.is_active = TRUE
                 GROUP BY u.user_id
                 ORDER BY active_tickets ASC
                 LIMIT 1`
            );

            if (agents.length > 0) {
                const agentId = agents[0].user_id;

                await pool.execute(
                    `UPDATE support_tickets 
                     SET assigned_to = ?, status = 'assigned', updated_at = CURRENT_TIMESTAMP
                     WHERE ticket_id = ?`,
                    [agentId, ticketId]
                );

                await pool.execute(
                    `INSERT INTO chat_messages (ticket_id, sender_id, sender_type, message_text, is_ai_generated)
                     VALUES (?, NULL, 'ai_bot', 'A support agent has joined the conversation and will assist you shortly.', TRUE)`,
                    [ticketId]
                );

                await pool.execute(
                    `INSERT INTO ticket_escalations (ticket_id, escalated_from, escalated_to, escalation_reason, escalation_level)
                     VALUES (?, NULL, ?, ?, 'agent')`,
                    [ticketId, agentId, reason]
                );

                console.log(`✅ Ticket ${ticketId} escalated to agent ${agentId}`);
            }
        } catch (error) {
            console.error('❌ Escalation error:', error);
        }
    },

    // Get restaurant complaints (Vendor)
    getRestaurantComplaints: async (req, res) => {
        try {
            const vendorId = req.user.user_id;

            const [complaints] = await pool.execute(
                `SELECT 
                    rc.*,
                    st.priority,
                    st.status,
                    st.created_at as ticket_created_at
                FROM restaurant_complaints rc
                JOIN support_tickets st ON rc.ticket_id = st.ticket_id
                JOIN restaurants r ON rc.restaurant_id = r.restaurant_id
                WHERE r.vendor_id = ?
                ORDER BY rc.created_at DESC
                LIMIT 50`,
                [vendorId]
            );

            res.json({ complaints });

        } catch (error) {
            console.error('❌ Get restaurant complaints error:', error);
            res.status(500).json({ error: 'Failed to get complaints' });
        }
    },
    
    // DEBUG: return ticket, chat messages and restaurant_complaints for a given ticket
    debugTicket: async (req, res) => {
        try {
            const { ticket_id } = req.params;

            const [tickets] = await pool.execute(
                `SELECT st.*, u.full_name as customer_name, r.restaurant_name
                 FROM support_tickets st
                 LEFT JOIN users u ON st.user_id = u.user_id
                 LEFT JOIN restaurants r ON st.restaurant_id = r.restaurant_id
                 WHERE st.ticket_id = ?`,
                [ticket_id]
            );

            if (tickets.length === 0) {
                return res.status(404).json({ error: 'Ticket not found' });
            }

            const ticket = tickets[0];

            const [messages] = await pool.execute(
                `SELECT cm.*, u.full_name as sender_name, u.user_type as sender_role
                 FROM chat_messages cm
                 LEFT JOIN users u ON cm.sender_id = u.user_id
                 WHERE cm.ticket_id = ? ORDER BY cm.created_at ASC`,
                [ticket_id]
            );

            const [complaints] = await pool.execute(
                `SELECT * FROM restaurant_complaints WHERE ticket_id = ?`,
                [ticket_id]
            );

            res.json({ ticket, messages, restaurant_complaints: complaints });
        } catch (error) {
            console.error('❌ Debug ticket error:', error.message);
            res.status(500).json({ error: 'Failed to debug ticket', details: error.message });
        }
    },

    // Additional helper methods...
    getAllTickets: async (req, res) => {
        try {
            const { status, priority } = req.query;
            const agentId = req.user.user_id;
            const userType = req.user.user_type;

            let query = `
                SELECT 
                    st.*,
                    u.full_name as customer_name,
                    u.email as customer_email,
                    r.restaurant_name,
                    agent.full_name as assigned_agent
                FROM support_tickets st
                JOIN users u ON st.user_id = u.user_id
                LEFT JOIN restaurants r ON st.restaurant_id = r.restaurant_id
                LEFT JOIN users agent ON st.assigned_to = agent.user_id
                WHERE st.status NOT IN ('resolved', 'closed')
            `;
            const params = [];

            if (userType === 'support_agent') {
                query += ` AND (st.assigned_to IS NULL OR st.assigned_to = ?)`;
                params.push(agentId);
            }

            if (status) {
                query += ` AND st.status = ?`;
                params.push(status);
            }

            if (priority) {
                query += ` AND st.priority = ?`;
                params.push(priority);
            }

            query += ` ORDER BY st.priority DESC, st.created_at ASC`;

            const [tickets] = await pool.execute(query, params);
            res.json({ tickets });

        } catch (error) {
            console.error('❌ Get all tickets error:', error);
            res.status(500).json({ error: 'Failed to get tickets' });
        }
    }
};

module.exports = supportController;