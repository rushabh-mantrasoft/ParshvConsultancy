const mysql = require('mysql2/promise');

/*
 * Create a connection pool to the MySQL database.
 * Update the configuration values to match your database server.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'parshv_consultancy',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
