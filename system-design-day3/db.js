
require("dotenv").config();

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306
});

module.exports = pool;


// Code ka simple meaning
// - require("dotenv").config() — .env ki settings load karta hai.
// - require("mysql2/promise") — MySQL ke saath asynchronous communication karne ki facility deta hai.
// - mysql.createPool() — database connections ko manage karne ke liye pool banata hai.
// - process.env.DB_HOST — .env se DB_HOST ki value read karta hai.
// - module.exports = pool — connection pool ko doosri files mein use karne deta hai.