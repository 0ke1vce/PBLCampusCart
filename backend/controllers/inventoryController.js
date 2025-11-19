const { pool } = require('../config/database');

const inventoryController = {
    getVendorInventory: async (req, res) => {
        try {
            const vendorId = req.user.user_id;
            console.log('📊 Loading inventory for vendor:', vendorId);

            if (!vendorId) {
                return res.status(400).json({ error: 'Vendor ID not found' });
            }

            const [inventory] = await pool.execute(`
                SELECT 
                    mi.item_id,
                    mi.item_name,
                    mi.description,
                    mi.price,
                    mi.category,
                    mi.current_stock,
                    mi.low_stock_threshold,
                    mi.is_available,
                    r.restaurant_name,
                    r.restaurant_id
                FROM menu_items mi
                JOIN restaurants r ON mi.restaurant_id = r.restaurant_id
                WHERE r.vendor_id = ?
                ORDER BY r.restaurant_name, mi.category, mi.item_name
            `, [vendorId]);

            console.log(`✅ Found ${inventory.length} inventory items for vendor ${vendorId}`);

            res.json({ 
                inventory: inventory || [],
                message: `Found ${inventory.length} items`
            });

        } catch (error) {
            console.error('❌ Get vendor inventory error:', error);
            res.status(500).json({ 
                error: 'Failed to load inventory',
                details: error.message 
            });
        }
    },

    getLowStockAlerts: async (req, res) => {
        try {
            const vendorId = req.user.user_id;

            const [alerts] = await pool.execute(`
                SELECT 
                    mi.item_id,
                    mi.item_name,
                    mi.current_stock,
                    mi.low_stock_threshold,
                    r.restaurant_name,
                    CASE 
                        WHEN mi.current_stock = 0 THEN 'out_of_stock'
                        WHEN mi.current_stock <= mi.low_stock_threshold THEN 'low_stock'
                        ELSE 'adequate'
                    END as alert_level
                FROM menu_items mi
                JOIN restaurants r ON mi.restaurant_id = r.restaurant_id
                WHERE r.vendor_id = ? AND (mi.current_stock = 0 OR mi.current_stock <= mi.low_stock_threshold)
                ORDER BY mi.current_stock ASC
            `, [vendorId]);

            res.json({ alerts });
        } catch (error) {
            console.error('Get low stock alerts error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    restockItem: async (req, res) => {
        try {
            const { item_id, quantity, reason } = req.body;
            const vendorId = req.user.user_id;

            console.log('📦 Restock request:', { item_id, quantity, reason, vendorId });

            if (!quantity || quantity <= 0) {
                return res.status(400).json({ error: 'Quantity must be greater than 0' });
            }

            const [items] = await pool.execute(`
                SELECT mi.item_id, mi.current_stock, mi.item_name
                FROM menu_items mi
                JOIN restaurants r ON mi.restaurant_id = r.restaurant_id
                WHERE mi.item_id = ? AND r.vendor_id = ?
            `, [item_id, vendorId]);

            if (items.length === 0) {
                return res.status(404).json({ error: 'Item not found or access denied' });
            }

            const connection = await pool.getConnection();
            await connection.beginTransaction();

            try {
                const currentStock = items[0].current_stock;
                const newStock = currentStock + quantity;

                await connection.execute(
                    `UPDATE menu_items 
                     SET current_stock = ?, 
                         is_available = TRUE, 
                         updated_at = CURRENT_TIMESTAMP 
                     WHERE item_id = ?`,
                    [newStock, item_id]
                );

                await connection.execute(
                    `INSERT INTO inventory_logs (item_id, change_type, quantity_change, previous_stock, new_stock, reason, changed_by)
                     VALUES (?, 'restock', ?, ?, ?, ?, ?)`,
                    [item_id, quantity, currentStock, newStock, reason || 'Manual restock', vendorId]
                );

                await connection.commit();
                connection.release();

                console.log(`✅ Item ${item_id} restocked: ${currentStock} → ${newStock}`);

                res.json({ 
                    message: 'Item restocked successfully',
                    item_id,
                    item_name: items[0].item_name,
                    previous_stock: currentStock,
                    new_stock: newStock,
                    quantity_added: quantity
                });

            } catch (error) {
                await connection.rollback();
                connection.release();
                throw error;
            }

        } catch (error) {
            console.error('Restock item error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    adjustStock: async (req, res) => {
        try {
            const { item_id, adjustment_type, quantity, reason } = req.body;
            const vendorId = req.user.user_id;

            console.log('🔧 Stock adjustment:', { item_id, adjustment_type, quantity, reason });

            if (!['restock', 'waste', 'adjustment'].includes(adjustment_type)) {
                return res.status(400).json({ error: 'Invalid adjustment type' });
            }

            if (!reason) {
                return res.status(400).json({ error: 'Reason is required for stock adjustments' });
            }

            if (!quantity || quantity <= 0) {
                return res.status(400).json({ error: 'Quantity must be greater than 0' });
            }

            const [items] = await pool.execute(`
                SELECT mi.item_id, mi.current_stock, mi.item_name
                FROM menu_items mi
                JOIN restaurants r ON mi.restaurant_id = r.restaurant_id
                WHERE mi.item_id = ? AND r.vendor_id = ?
            `, [item_id, vendorId]);

            if (items.length === 0) {
                return res.status(404).json({ error: 'Item not found or access denied' });
            }

            const currentStock = items[0].current_stock;
            let newStock;
            let quantityChange;

            if (adjustment_type === 'restock') {
                newStock = currentStock + quantity;
                quantityChange = quantity;
            } else {
                if (quantity > currentStock) {
                    return res.status(400).json({ error: 'Adjustment quantity exceeds current stock' });
                }
                newStock = currentStock - quantity;
                quantityChange = -quantity;
            }

            const connection = await pool.getConnection();
            await connection.beginTransaction();

            try {
                const isAvailable = newStock > 0;
                await connection.execute(
                    `UPDATE menu_items 
                     SET current_stock = ?, 
                         is_available = ?,
                         updated_at = CURRENT_TIMESTAMP 
                     WHERE item_id = ?`,
                    [newStock, isAvailable, item_id]
                );

                await connection.execute(
                    `INSERT INTO inventory_logs (item_id, change_type, quantity_change, previous_stock, new_stock, reason, changed_by)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [item_id, adjustment_type, quantityChange, currentStock, newStock, reason, vendorId]
                );

                await connection.commit();
                connection.release();

                console.log(` Stock adjusted for item ${item_id}: ${currentStock} → ${newStock}`);

                res.json({ 
                    message: 'Stock adjusted successfully',
                    item_id,
                    item_name: items[0].item_name,
                    adjustment_type,
                    previous_stock: currentStock,
                    new_stock: newStock,
                    quantity_change: quantityChange
                });

            } catch (error) {
                await connection.rollback();
                connection.release();
                throw error;
            }

        } catch (error) {
            console.error('Adjust stock error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getItemLogs: async (req, res) => {
        try {
            const { item_id } = req.params;
            const vendorId = req.user.user_id;

            const [items] = await pool.execute(`
                SELECT mi.item_id 
                FROM menu_items mi
                JOIN restaurants r ON mi.restaurant_id = r.restaurant_id
                WHERE mi.item_id = ? AND r.vendor_id = ?
            `, [item_id, vendorId]);

            if (items.length === 0) {
                return res.status(404).json({ error: 'Item not found or access denied' });
            }

            const [logs] = await pool.execute(`
                SELECT 
                    il.log_id,
                    il.change_type,
                    il.quantity_change,
                    il.previous_stock,
                    il.new_stock,
                    il.reason,
                    il.log_timestamp,
                    u.full_name as changed_by_name
                FROM inventory_logs il
                LEFT JOIN users u ON il.changed_by = u.user_id
                WHERE il.item_id = ?
                ORDER BY il.log_timestamp DESC
                LIMIT 50
            `, [item_id]);

            res.json({ logs });
        } catch (error) {
            console.error('Get item logs error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = inventoryController;