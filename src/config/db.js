const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // XAMPP varsayılan kullanıcı
  password: '',   // XAMPP varsayılan şifre boştur
database: 'mcgshop',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0});

pool.getConnection()
    .then(conn => {
        console.log('MySQL Veritabanına başarıyla bağlanıldı.');
        conn.release();
    })
    .catch(err => console.log('Veritabanı bağlantı hatası:', err));

module.exports = pool;