const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Rotaları İçe Aktar
const categoryRoutes = require('./src/api/routes/categoriesRoutes');

const userRoutes = require('./src/api/routes/userRoutes');
const adminRoutes = require('./src/api/routes/adminRoutes');
const cartRoutes = require('./src/api/routes/cartRoutes');
const orderRoutes = require('./src/api/routes/orderRoutes');
const productRoutes = require('./src/api/routes/productRoutes');
const reviewRoutes = require('./src/api/routes/reviewRoutes');
const db = require('./src/config/db');

app.get('/api/categories', async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories ORDER BY id');
        res.json(categories);
    } catch (error) {
        console.error('Kategori getirme hatası:', error);
        res.status(500).json({ error: 'Kategoriler yüklenirken bir hata oluştu' });
    }
});

// Yeni kategori ekle (ADMIN)
app.post('/api/admin/categories', async (req, res) => {
    try {
        const { name, icon, active } = req.body;
        
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Kategori adı gereklidir' });
        }
        
        const [result] = await db.query(
            'INSERT INTO categories (name, icon, active) VALUES (?, ?, ?)',
            [name.trim(), icon || '📦', active !== false ? 1 : 0]
        );
        
        res.json({ 
            id: result.insertId, 
            name: name.trim(), 
            icon: icon || '📦', 
            active: active !== false 
        });
    } catch (error) {
        console.error('Kategori ekleme hatası:', error);
        res.status(500).json({ error: 'Kategori eklenirken bir hata oluştu' });
    }
});

// Kategori güncelle (ADMIN)
app.put('/api/admin/categories/:id', async (req, res) => {
    try {
        const { name, icon, active } = req.body;
        const categoryId = req.params.id;
        
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Kategori adı gereklidir' });
        }
        
        await db.query(
            'UPDATE categories SET name = ?, icon = ?, active = ? WHERE id = ?',
            [name.trim(), icon || '📦', active !== false ? 1 : 0, categoryId]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Kategori güncelleme hatası:', error);
        res.status(500).json({ error: 'Kategori güncellenirken bir hata oluştu' });
    }
});

// Kategori sil (ADMIN)
app.delete('/api/admin/categories/:id', async (req, res) => {
    try {
        const categoryId = req.params.id;
        
        const [products] = await db.query('SELECT COUNT(*) as count FROM products WHERE category = (SELECT name FROM categories WHERE id = ?)', [categoryId]);
        
        if (products[0].count > 0) {
            return res.status(400).json({ error: 'Bu kategoriye ait ürünler var. Önce ürünleri taşıyın veya silin.' });
        }
        
        await db.query('DELETE FROM categories WHERE id = ?', [categoryId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Kategori silme hatası:', error);
        res.status(500).json({ error: 'Kategori silinirken bir hata oluştu' });
    }
});




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
app.use('/api/categories', categoryRoutes);

// 2. SONRA STATİK DOSYALAR (Resimler ve Build dosyaları)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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