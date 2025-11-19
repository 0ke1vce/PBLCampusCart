const { pool } = require('../config/database');

const restaurantController = {
    getAllRestaurants: async (req, res) => {
        try {
            const { outlet_type } = req.query;
            console.log('📍 Fetching restaurants...', outlet_type ? `(${outlet_type})` : '(all)');
            
            let query = `
                SELECT r.*, u.full_name as vendor_name 
                FROM restaurants r 
                JOIN users u ON r.vendor_id = u.user_id 
                -- Include closed restaurants so students can see closed status in listings
                WHERE 1=1
            `;
            
            const params = [];
            
            if (outlet_type && ['food', 'grocery', 'stationary'].includes(outlet_type)) {
                query += ' AND r.outlet_type = ?';
                params.push(outlet_type);
            }
            
            query += ' ORDER BY r.outlet_type, r.rating DESC';
            
            const [restaurants] = await pool.execute(query, params);

            console.log(`✅ Found ${restaurants.length} open restaurants`);
            res.json({ restaurants });
        } catch (error) {
            console.error('❌ Get restaurants error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getRestaurantsByOutlet: async (req, res) => {
        try {
            const { outlet_type } = req.params;
            
            if (!['food', 'grocery', 'stationary'].includes(outlet_type)) {
                return res.status(400).json({ error: 'Invalid outlet type' });
            }
            
            console.log(`📍 Fetching ${outlet_type} restaurants...`);
            
            const [restaurants] = await pool.execute(`
                SELECT r.*, u.full_name as vendor_name 
                FROM restaurants r 
                JOIN users u ON r.vendor_id = u.user_id 
                WHERE r.outlet_type = ?
                ORDER BY r.rating DESC
            `, [outlet_type]);

            console.log(`✅ Found ${restaurants.length} ${outlet_type} restaurants`);
            res.json({ restaurants });
        } catch (error) {
            console.error('❌ Get restaurants by outlet error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getRestaurantById: async (req, res) => {
        try {
            const { id } = req.params;

            const [restaurants] = await pool.execute(`
                SELECT r.*, u.full_name as vendor_name 
                FROM restaurants r 
                JOIN users u ON r.vendor_id = u.user_id 
                WHERE r.restaurant_id = ?
            `, [id]);

            if (restaurants.length === 0) {
                return res.status(404).json({ error: 'Restaurant not found' });
            }

            res.json({ restaurant: restaurants[0] });
        } catch (error) {
            console.error('❌ Get restaurant error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getVendorRestaurants: async (req, res) => {
        try {
            const vendorId = req.user.user_id;
            console.log('📍 Fetching restaurants for vendor:', vendorId);

            const [restaurants] = await pool.execute(`
                SELECT * FROM restaurants 
                WHERE vendor_id = ?
                ORDER BY outlet_type, created_at DESC
            `, [vendorId]);

            console.log(`✅ Found ${restaurants.length} restaurant(s) for vendor ${vendorId}`);
            res.json({ restaurants });
        } catch (error) {
            console.error('❌ Get vendor restaurants error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    updateRestaurantStatus: async (req, res) => {
        try {
            const { restaurant_id } = req.params;
            const { is_open } = req.body;
            const vendorId = req.user.user_id;

            const [restaurants] = await pool.execute(
                'SELECT restaurant_id FROM restaurants WHERE restaurant_id = ? AND vendor_id = ?',
                [restaurant_id, vendorId]
            );

            if (restaurants.length === 0) {
                return res.status(404).json({ error: 'Restaurant not found or access denied' });
            }

            await pool.execute(
                'UPDATE restaurants SET is_open = ?, updated_at = CURRENT_TIMESTAMP WHERE restaurant_id = ?',
                [is_open, restaurant_id]
            );

            console.log(`✅ Restaurant ${restaurant_id} status updated to: ${is_open ? 'OPEN' : 'CLOSED'}`);
            res.json({ 
                message: 'Restaurant status updated',
                restaurant_id,
                is_open
            });
        } catch (error) {
            console.error('❌ Update restaurant status error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getOutletStats: async (req, res) => {
        try {
            const [stats] = await pool.execute(`
                SELECT 
                    outlet_type,
                    COUNT(*) as store_count,
                    SUM(CASE WHEN is_open = TRUE THEN 1 ELSE 0 END) as open_count,
                    AVG(rating) as avg_rating
                FROM restaurants
                GROUP BY outlet_type
            `);

            res.json({ stats });
        } catch (error) {
            console.error('❌ Get outlet stats error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = restaurantController;