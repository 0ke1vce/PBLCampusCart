const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'campuscart1',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

console.log('📊 Database Configuration:');
console.log(`   Host: ${dbConfig.host}`);
console.log(`   User: ${dbConfig.user}`);
console.log(`   Database: ${dbConfig.database}`);

const pool = mysql.createPool(dbConfig);

const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        
        const [users] = await connection.execute('SELECT COUNT(*) as user_count FROM users');
        const [restaurants] = await connection.execute('SELECT COUNT(*) as restaurant_count FROM restaurants');
        const [menuItems] = await connection.execute('SELECT COUNT(*) as item_count FROM menu_items');
        
        console.log(`📈 Database Statistics:`);
        console.log(`   Users: ${users[0].user_count}`);
        console.log(`   Restaurants: ${restaurants[0].restaurant_count}`);
        console.log(`   Menu Items: ${menuItems[0].item_count}`);
        
        // Ensure sessions table exists so we can track multiple sessions per user
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS sessions (
                session_id VARCHAR(36) PRIMARY KEY,
                user_id INT NOT NULL,
                ip_address VARCHAR(45),
                user_agent VARCHAR(255),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                expires_at DATETIME,
                is_active TINYINT(1) DEFAULT 1,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);

        console.log('🛡️  Sessions table verified/created');
        
        connection.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        throw error;
    }
};

module.exports = { pool, testConnection };