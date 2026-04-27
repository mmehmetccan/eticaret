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

// CORS ayarları
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL,
    'https://www.mcgshop.com',
    'http://www.mcgshop.com'
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('CORS engellendi'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. ÖNCE API ROTALARI
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);

// 2. SONRA STATİK DOSYALAR (Resimler ve Build dosyaları)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// 3. EN SON SPA YÖNLENDİRMESİ (Sadece API olmayan istekler için)
// Hata veren regexli get yerine bu kesin çözümü kullan:
app.use((req, res, next) => {
    // Eğer istek /api ile başlıyorsa ve buraya kadar düştüyse 404 dön
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: "API endpoint bulunamadı" });
    }
    // Geri kalan her şeyi frontend'e yönlendir
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