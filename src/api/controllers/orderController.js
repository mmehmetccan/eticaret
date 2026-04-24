// src/api/controllers/orderController.js (GÜNCELLENMİŞ - Adres kaydediyor)
const db = require('../../config/db');

const createOrder = async (req, res) => {
    const userId = req.user.id;
    const { 
        shipping_address, 
        city, 
        district, 
        zip_code, 
        shipping_method, 
        installment 
    } = req.body;
    
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Sepetteki ürünleri al
        const [cartItems] = await connection.execute(
            `SELECT c.*, p.price, p.stock_quantity, p.name 
             FROM cart_items c 
             JOIN products p ON c.product_id = p.id 
             WHERE c.user_id = ?`,
            [userId]
        );

        if (cartItems.length === 0) {
            return res.status(400).json({ error: "Sepetiniz boş." });
        }

        let totalPrice = 0;

        // Her ürün için stok kontrolü ve stok düşme
        for (const item of cartItems) {
            // Stok kontrolü (FOR UPDATE ile kilitle)
            const [productRows] = await connection.execute(
                'SELECT stock_quantity, price FROM products WHERE id = ? FOR UPDATE',
                [item.product_id]
            );
            
            const product = productRows[0];

            if (!product) {
                throw new Error(`${item.product_id} ID'li ürün bulunamadı.`);
            }

            // Stok yeterli mi?
            if (product.stock_quantity < item.quantity) {
                throw new Error(`${item.name} için yeterli stok yok! Kalan stok: ${product.stock_quantity}`);
            }

            totalPrice += product.price * item.quantity;

            // STOKTAN DÜŞ
            await connection.execute(
                'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }

        // Sipariş oluştur - ADRES BİLGİLERİNİ DE KAYDET
        const [orderResult] = await connection.execute(
            `INSERT INTO orders 
            (user_id, total_price, status, shipping_address, city, district, zip_code, shipping_method, installment) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, totalPrice, 'pending', shipping_address, city, district, zip_code, shipping_method, installment || 1]
        );

        const orderId = orderResult.insertId;

        // Sipariş kalemlerini ekle
        for (const item of cartItems) {
            await connection.execute(
                'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
        }

        // Sepeti temizle
        await connection.execute('DELETE FROM cart_items WHERE user_id = ?', [userId]);

        await connection.commit();
        
        res.status(201).json({ 
            message: "Sipariş başarıyla oluşturuldu ve stok güncellendi!", 
            orderId 
        });

    } catch (err) {
        await connection.rollback();
        console.error("Sipariş Hatası:", err.message);
        res.status(400).json({ error: err.message });
    } finally {
        connection.release();
    }
};

module.exports = { createOrder };