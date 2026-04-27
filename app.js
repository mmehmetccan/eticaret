const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Rotaları İçe Aktar
const userRoutes = require('./src/api/routes/userRoutes');
const adminRoutes = require('./src/api/routes/adminRoutes');
const cartRoutes = require('./src/api/routes/cartRoutes');
const orderRoutes = require('./src/api/routes/orderRoutes');
const productRoutes = require('./src/api/routes/productRoutes');
const reviewRoutes = require('./src/api/routes/reviewRoutes');

// CORS ayarları (VPS için)
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL?.replace('https://', 'http://'),
    'https://www.mcgshop.com',  // Kendi domaininizle değiştirin
    'http://www.mcgshop.com'
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        // origin yoksa (Postman, curl gibi) izin ver
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            console.log('❌ CORS engellendi:', origin);
            callback(new Error('CORS politikası tarafından engellendi'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// JSON body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads klasörü (resimler için)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
// Frontend Build Dosyalarını Servis Et
app.use(express.static(path.join(__dirname, 'public')));

// Rotaları Kullan
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);

// 404 handler
// API dışındaki tüm istekleri frontend'e (index.html) yönlendir
app.get('(.*)', (req, res) => {
    // Eğer istek /api ile başlıyorsa ama bulunamadıysa 404 döndür
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint bulunamadı' });
    }
    // Geri kalan her şey için index.html gönder
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global hata yakalayıcı
app.use((err, req, res, next) => {
    console.error('❌ Hata:', err.message);
    res.status(err.status || 500).json({ 
        error: err.message || 'Sunucu hatası oluştu' 
    });
});

module.exports = app;