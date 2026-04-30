const db = require('../../config/db');

const getCart = async (req, res) => {
    try {
        const query = `
            SELECT 
                c.*, 
                p.name, 
                p.price, 
                COALESCE(
                    (SELECT image_url FROM product_images WHERE product_id = p.id AND is_main = 1 LIMIT 1),
                    p.image_url
                ) as image_url
            FROM cart_items c 
            JOIN products p ON c.product_id = p.id 
            WHERE c.user_id = ?`;
            
        const [rows] = await db.execute(query, [req.user.id]);
        res.json(rows);
    } catch (err) {
        console.error("Sepet getirme hatası:", err);
        res.status(500).json({ error: "Sepet getirilemedi." });
    }
};

const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    try {
        // 1. Adım: Ürünün veritabanındaki güncel stok miktarını al
        const [productRows] = await db.execute(
            'SELECT stock_quantity, name FROM products WHERE id = ?',
            [productId]
        );
        const product = productRows[0];

        if (!product) return res.status(404).json({ error: "Ürün bulunamadı." });

        // 2. Adım: Kullanıcının sepetinde halihazırda bu üründen kaç tane var?
        const [cartRows] = await db.execute(
            'SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );
        
        const existingQuantity = cartRows.length > 0 ? cartRows[0].quantity : 0;
        const newTotalQuantity = existingQuantity + (quantity || 1);

        // 3. Adım: Yeni toplam miktar stoktan fazlaysa engelle
        if (newTotalQuantity > product.stock_quantity) {
            return res.status(400).json({ 
                error: `Yetersiz stok! Bu üründen toplamda en fazla ${product.stock_quantity} adet alabilirsiniz.`,
                availableStock: product.stock_quantity
            });
        }

        // 4. Adım: Stok uygunsa sepete ekle veya güncelle
        const query = `
            INSERT INTO cart_items (user_id, product_id, quantity) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`;
        
        await db.execute(query, [userId, productId, quantity || 1]);
        res.json({ message: "Ürün sepete eklendi." });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Sepet işlemi başarısız oldu." });
    }
};

const removeFromCart = async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id;

    try {
        // 1. Önce ürünün mevcut miktarını kontrol et
        const [rows] = await db.execute(
            'SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (rows.length === 0) return res.status(404).json({ error: "Ürün sepette bulunamadı." });

        const currentQuantity = rows[0].quantity;

        if (currentQuantity > 1) {
            // 2. Miktar 1'den büyükse: 1 AZALT
            await db.execute(
                'UPDATE cart_items SET quantity = quantity - 1 WHERE user_id = ? AND product_id = ?',
                [userId, productId]
            );
            res.json({ message: "Miktar azaltıldı." });
        } else {
            // 3. Miktar 1 ise: TAMAMEN SİL
            await db.execute(
                'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
                [userId, productId]
            );
            res.json({ message: "Ürün sepetten kaldırıldı." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "İşlem sırasında hata oluştu." });
    }
};



module.exports = { getCart, addToCart, removeFromCart };