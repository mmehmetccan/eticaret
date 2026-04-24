// src/api/controllers/reviewController.js
const db = require('../../config/db');

// Ürüne yorum ekle
const addReview = async (req, res) => {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;

    try {
        // Daha önce yorum yapılmış mı kontrol et
        const [existing] = await db.execute(
            'SELECT id FROM product_reviews WHERE product_id = ? AND user_id = ?',
            [productId, userId]
        );

        if (existing.length > 0) {
            // Var olan yorumu güncelle
            await db.execute(
                'UPDATE product_reviews SET rating = ?, comment = ?, created_at = NOW() WHERE product_id = ? AND user_id = ?',
                [rating, comment, productId, userId]
            );
        } else {
            // Yeni yorum ekle
            await db.execute(
                'INSERT INTO product_reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
                [productId, userId, rating, comment]
            );
        }

        // Ürünün ortalama puanını güncelle
        await updateProductRating(productId);

        res.json({ message: "Yorumunuz başarıyla kaydedildi!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Yorum eklenirken hata oluştu." });
    }
};

// Ürünün ortalama puanını güncelle
const updateProductRating = async (productId) => {
    const [result] = await db.execute(
        `SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews 
         FROM product_reviews WHERE product_id = ?`,
        [productId]
    );
    
    const avgRating = result[0].avg_rating || 0;
    const totalReviews = result[0].total_reviews || 0;
    
    await db.execute(
        'UPDATE products SET avg_rating = ?, total_reviews = ? WHERE id = ?',
        [avgRating, totalReviews, productId]
    );
};

// Ürünün yorumlarını getir
const getProductReviews = async (req, res) => {
    const { productId } = req.params;
    
    try {
        const [reviews] = await db.execute(
            `SELECT r.*, u.full_name, u.email 
             FROM product_reviews r
             JOIN users u ON r.user_id = u.id
             WHERE r.product_id = ? AND r.is_approved = TRUE
             ORDER BY r.created_at DESC`,
            [productId]
        );
        
        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Yorumlar getirilemedi." });
    }
};

// Kullanıcının kendi yorumunu getir
const getUserReview = async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id;
    
    try {
        const [review] = await db.execute(
            'SELECT * FROM product_reviews WHERE product_id = ? AND user_id = ?',
            [productId, userId]
        );
        
        res.json(review[0] || null);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Yorum getirilemedi." });
    }
};

module.exports = { addReview, getProductReviews, getUserReview, updateProductRating };