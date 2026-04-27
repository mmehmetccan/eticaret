// productController.js - TAMAMEN DEĞİŞTİRİN

const db = require('../../config/db');

const getAllProducts = async (req, res) => {
    const { category } = req.query;
    const userId = req.user?.id;
    
    try {
        let query = `
            SELECT p.*, 
                   (SELECT COUNT(*) FROM order_items WHERE product_id = p.id) as total_sold,
                   (SELECT image_url FROM product_images WHERE product_id = p.id AND is_main = TRUE LIMIT 1) as main_image,
                   COALESCE(p.avg_rating, 0) as avg_rating,
                   COALESCE(p.total_reviews, 0) as total_reviews
            FROM products p
        `;
        let params = [];
        if (category) {
            query += ' WHERE p.category = ?';
            params.push(category);
        }
        query += ' ORDER BY p.created_at DESC';
        const [rows] = await db.execute(query, params);
        
        let favorites = [];
        if (userId) {
            const [favRows] = await db.execute(
                'SELECT product_id FROM favorites WHERE user_id = ?',
                [userId]
            );
            favorites = favRows.map(f => f.product_id);
        }
        
        const products = rows.map(product => ({
            ...product,
            image_url: product.main_image || product.image_url || null,
            rating: parseFloat(product.avg_rating || 0).toFixed(1),
            rating_count: product.total_reviews || 0,
            isFavorite: favorites.includes(product.id)
        }));
        
        res.status(200).json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ürünler getirilemedi." });
    }
};

const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const [productRows] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
        if (productRows.length === 0) {
            return res.status(404).json({ error: "Ürün bulunamadı." });
        }
        
        const [imageRows] = await db.execute(
            'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_main DESC, display_order ASC',
            [id]
        );
        
        const mainImage = imageRows.find(img => img.is_main === 1) || imageRows[0];
        
        res.json({
            ...productRows[0],
            image_url: mainImage?.image_url || productRows[0].image_url,
            images: imageRows,
            main_image: mainImage
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
};

const addProduct = async (req, res) => {
    console.log("📦 ADD PRODUCT - Body:", req.body);
    
    try {
        const { name, category, price, description, stock_quantity, discount, is_new, free_shipping, details } = req.body;
        
        // Fiyatı sadece rakamlara çevir
        let cleanPrice = 0;
if (price) {
    let p = price.toString();

    if (p.includes(',') && p.includes('.')) {
        p = p.replace(/\./g, '').replace(',', '.');
    } else if (p.includes(',')) {
        p = p.replace(',', '.');
    }

    cleanPrice = parseFloat(p);
}
        
        
        console.log("💰 Temizlenmiş fiyat:", cleanPrice);
        
        if (!name) return res.status(400).json({ error: "Ürün adı zorunludur." });
        if (!category) return res.status(400).json({ error: "Kategori zorunludur." });
        if (!cleanPrice || isNaN(cleanPrice)) return res.status(400).json({ error: "Geçerli bir fiyat zorunludur." });
        
        let image_url = null;
        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        }
        
        const query = `
    INSERT INTO products 
    (name, category, price, description, stock_quantity, image_url, discount, is_new, free_shipping, details) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;
const [result] = await db.execute(query, [
    name, category, cleanPrice, description || '', stock_quantity || 0, 
    image_url, discount || 0, is_new === 'true' ? 1 : 0, 
    free_shipping === 'true' ? 1 : 0,
    details || ''
]);
        
        if (image_url) {
    // Hem ana tabloyu hem de resimler tablosunu güncellediğinden emin oluyoruz
    await db.execute(
        'UPDATE products SET image_url = ? WHERE id = ?',
        [image_url, result.insertId]
    );
    await db.execute(
        'INSERT INTO product_images (product_id, image_url, is_main, display_order) VALUES (?, ?, ?, ?)',
        [result.insertId, image_url, 1, 0]
    );
}
        
        res.status(201).json({ message: "Ürün eklendi", productId: result.insertId });
    } catch (err) {
        console.error("Ekleme hatası:", err);
        res.status(500).json({ error: "Ekleme hatası: " + err.message });
    }
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    
    try {
        const { name, category, price: priceRaw, description, details } = req.body;
        const stock_quantity = parseInt(req.body.stock_quantity) || 0;
        const discount = parseInt(req.body.discount) || 0;
        const is_new = req.body.is_new === 'true' || req.body.is_new === '1' || req.body.is_new === 1 ? 1 : 0;
        const free_shipping = req.body.free_shipping === 'true' || req.body.free_shipping === '1' || req.body.free_shipping === 1 ? 1 : 0;
        
        // FİYAT TEMİZLEME: Gelen verideki tüm noktaları/virgülleri temizleyip tam sayıya çeviriyoruz
        let cleanPrice = 0;
        if (priceRaw) {
            // Sadece rakamları tut (Regex ile tüm non-numeric karakterleri siliyoruz)
            const numericString = priceRaw.toString().split('.')[0].replace(/[^0-9]/g, '');
            cleanPrice = parseInt(numericString) || 0;
        }

        let query;
        let params;
        
        if (req.file) {
            const image_url = `/uploads/${req.file.filename}`;
            query = `UPDATE products SET 
                        name=?, category=?, price=?, description=?, stock_quantity=?, 
                        discount=?, is_new=?, free_shipping=?, details=?, image_url=? 
                     WHERE id=?`;
            params = [name, category, cleanPrice, description || '', stock_quantity, discount, is_new, free_shipping, details || '', image_url, id];
        } else {
            query = `UPDATE products SET 
                        name=?, category=?, price=?, description=?, stock_quantity=?, 
                        discount=?, is_new=?, free_shipping=?, details=? 
                     WHERE id=?`;
            params = [name, category, cleanPrice, description || '', stock_quantity, discount, is_new, free_shipping, details || '', id];
        }

        const [result] = await db.execute(query, params);
        res.json({ message: "Ürün başarıyla güncellendi.", price: cleanPrice });
        
    } catch (err) {
        console.error("❌ Güncelleme hatası:", err);
        res.status(500).json({ error: "Sistem hatası: " + err.message });
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM product_images WHERE product_id = ?', [id]);
        await db.execute('DELETE FROM products WHERE id = ?', [id]);
        res.json({ message: "Ürün başarıyla silindi." });
    } catch (err) {
        console.error("Silme hatası:", err);
        res.status(500).json({ error: "Silme hatası." });
    }
};

const addProductImage = async (req, res) => {
    try {
        const { productId } = req.params;
        console.log("📸 Gelen Dosya:", req.file); // Sunucu terminalinde (docker logs) bunu kontrol et

        if (!req.file) {
            return res.status(400).json({ error: "Resim dosyası sunucuya ulaşmadı." });
        }

        const image_url = `/uploads/${req.file.filename}`;
        const { is_main, display_order } = req.body;

        // Veri tipi kontrolü (is_main string olarak gelebilir)
        const isMainBool = is_main === 'true' || is_main === true || is_main === 1;

        if (isMainBool) {
            await db.execute('UPDATE product_images SET is_main = FALSE WHERE product_id = ?', [productId]);
        }

        await db.execute(
            'INSERT INTO product_images (product_id, image_url, is_main, display_order) VALUES (?, ?, ?, ?)',
            [productId, image_url, isMainBool, display_order || 0]
        );

        res.json({ message: "Resim başarıyla eklendi.", image_url });
    } catch (err) {
        console.error("Resim kayıt hatası:", err);
        res.status(500).json({ error: "Veritabanı kayıt hatası." });
    }
};

const deleteProductImage = async (req, res) => {
    const { imageId } = req.params;
    try {
        await db.execute('DELETE FROM product_images WHERE id = ?', [imageId]);
        res.json({ message: "Resim silindi." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Resim silinemedi." });
    }
};

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Resim dosyası bulunamadı." });
        }
        
        const image_url = `/uploads/${req.file.filename}`;
        res.json({ 
            message: "Resim başarıyla yüklendi!", 
            image_url: image_url 
        });
    } catch (err) {
        console.error("Resim yükleme hatası:", err);
        res.status(500).json({ error: "Resim yüklenemedi." });
    }
};

module.exports = { 
    getAllProducts, 
    getProductById,
    addProduct, 
    updateProduct,
    deleteProduct,
    addProductImage,
    deleteProductImage,
    uploadImage
};