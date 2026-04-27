const mysql = require('mysql2/promise');
const path = require('path');
// .env dosyasının tam yolunu göstererek garantiye alıyoruz
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

console.log("-----------------------------------------");
console.log("DEBUG: DB_HOST değeri ->", process.env.DB_HOST);
console.log("-----------------------------------------");

const pool = mysql.createPool({
    host: process.env.DB_HOST || '172.17.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'mcgshop',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then(conn => {
        console.log('✅ MySQL Veritabanına başarıyla bağlanıldı.');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Veritabanı bağlantı hatası:', err.message);
    });

module.exports = pool;