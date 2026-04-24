require('dotenv').config();
const app = require('./app');
const db = require('./src/config/db');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Veritabanı bağlantısını test et ve sunucuyu başlat
const startServer = async () => {
    try {
        const connection = await db.getConnection();
        console.log('✅ MySQL Veritabanı bağlantısı başarılı.');
        connection.release();

        app.listen(PORT, () => {
            console.log(`🚀 MCGShop sunucusu ${NODE_ENV} modunda çalışıyor.`);
            console.log(`📡 Adres: http://localhost:${PORT}`);
            if (NODE_ENV === 'production') {
                console.log(`🌐 API URL: ${process.env.API_URL || `http://localhost:${PORT}`}`);
                console.log(`🖥️  Frontend URL: ${process.env.FRONTEND_URL}`);
            }
        });
    } catch (err) {
        console.error('❌ Veritabanı bağlantı hatası:', err.message);
        console.error('💡 Lütfen .env dosyasındaki veritabanı ayarlarını kontrol edin.');
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('🛑 Sunucu kapatılıyor...');
    try {
        await db.end();
        console.log('✅ Veritabanı bağlantısı kapatıldı.');
    } catch (err) {
        console.error('❌ Veritabanı kapatma hatası:', err);
    }
    process.exit(0);
});

startServer();