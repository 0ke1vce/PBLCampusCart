const { pool } = require('../config/database');

const menuController = {
    getRestaurantMenu: async (req, res) => {
        try {
            const { restaurant_id } = req.params;

            // Only show items that are available AND have stock > 0
            const [menuItems] = await pool.execute(`
                SELECT 
                    item_id,
                    restaurant_id,
                    item_name,
                    description,
                    price,
                    category,
                    current_stock,
                    low_stock_threshold,
                    is_available,
                    created_at,
                    updated_at
                FROM menu_items 
                WHERE restaurant_id = ? 
                  AND is_available = TRUE 
                  AND current_stock > 0
                ORDER BY category, item_name
            `, [restaurant_id]);

            console.log(`✅ Loaded ${menuItems.length} available items for restaurant ${restaurant_id}`);
            res.json({ menu: menuItems });
        } catch (error) {
            console.error('❌ Get menu error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getVendorMenu: async (req, res) => {
        try {
            const { restaurant_id } = req.params;
            const vendorId = req.user.user_id;

            const [restaurants] = await pool.execute(
                'SELECT restaurant_id FROM restaurants WHERE restaurant_id = ? AND vendor_id = ?',
                [restaurant_id, vendorId]
            );

            if (restaurants.length === 0) {
                return res.status(404).json({ error: 'Restaurant not found or access denied' });
            }

            const [menuItems] = await pool.execute(`
                SELECT * FROM menu_items 
                WHERE restaurant_id = ?
                ORDER BY category, item_name
            `, [restaurant_id]);

            res.json({ menu: menuItems });
        } catch (error) {
            console.error('❌ Get vendor menu error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = menuController;