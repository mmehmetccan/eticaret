require('dotenv').config();
const app = require('./app');
const db = require('./src/config/db');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ========== KATEGORİ ROTALARI (DOĞRUDAN SERVER.JS İÇİNE) ==========

// Kategorileri getir (HERKES erişebilir - ana mağaza için)
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
        
        // Önce bu kategoriye ait ürün var mı kontrol et (isteğe bağlı)
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

// ========== VERİTABANI BAĞLANTISI VE SUNUCU BAŞLATMA ==========

// Veritabanı bağlantısını test et ve sunucuyu başlat
const startServer = async () => {
    try {
        const connection = await db.getConnection();
        console.log('✅ MySQL Veritabanı bağlantısı başarılı.');
        connection.release();
        
        // Kategoriler tablosunu kontrol et ve yoksa oluştur
        await ensureCategoriesTable();
        
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

// Kategoriler tablosunu kontrol et ve oluştur
const ensureCategoriesTable = async () => {
    try {
        const [tables] = await db.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                icon VARCHAR(10) DEFAULT '📦',
                active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Categories tablosu kontrol edildi/hazır.');
        
        // Varsayılan kategorileri ekle (eğer tablo boşsa)
        const [existing] = await db.query('SELECT COUNT(*) as count FROM categories');
        if (existing[0].count === 0) {
            const defaultCategories = [
                { name: 'Parfüm', icon: '🌸', active: true },
                { name: 'Makyaj', icon: '💄', active: true },
                { name: 'Cilt Bakım', icon: '✨', active: true },
                { name: 'Saç Bakım', icon: '💇‍♀️', active: true },
                { name: 'Vücut Bakım', icon: '🧴', active: true },
                { name: 'Erkek Bakım', icon: '🧔', active: true },
                { name: 'Aksesuar', icon: '👜', active: true },
                { name: 'Markalar', icon: '⭐', active: true }
            ];
            
            for (const cat of defaultCategories) {
                await db.query(
                    'INSERT INTO categories (name, icon, active) VALUES (?, ?, ?)',
                    [cat.name, cat.icon, cat.active ? 1 : 0]
                );
            }
            console.log('✅ Varsayılan kategoriler eklendi (Kozmetik odaklı).');
        }
    } catch (error) {
        console.error('Categories tablosu oluşturma hatası:', error);
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