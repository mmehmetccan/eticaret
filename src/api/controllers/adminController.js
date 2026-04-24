const db = require('../../config/db');

const getAdminOrders = async (req, res) => {
    try {
        // 1. Önce siparişleri ve müşteri bilgilerini al
        const query = `
            SELECT 
                o.*, 
                u.email, 
                u.full_name,
                u.phone_number
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            ORDER BY o.order_date DESC
        `;
        const [orders] = await db.execute(query);
        
        // 2. Her sipariş için ürünleri ayrı ayrı çek
        const ordersWithItems = [];
        
        for (const order of orders) {
            // Siparişe ait ürünleri çek
            const [items] = await db.execute(`
                SELECT 
                    oi.*, 
                    p.name as product_name,
                    p.image_url,
                    (oi.quantity * oi.unit_price) as total
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `, [order.id]);
            
            // Toplam ürün adedini hesapla
            const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
            
            ordersWithItems.push({
                ...order,
                total_items: totalItems,
                items: items
            });
        }
        
        res.json(ordersWithItems);
    } catch (err) {
        console.error("Sipariş listesi hatası:", err);
        res.status(500).json({ error: "Sipariş listesi alınamadı." });
    }
};

const updateOrderStatus = async (req, res) => {
    const { orderId, status, trackingNumber, shippingCompany, notes } = req.body;
    const adminId = req.user.id;
    
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();
        
        // Önce eski durumu al
        const [oldOrder] = await connection.execute(
            'SELECT status FROM orders WHERE id = ?',
            [orderId]
        );
        
        const oldStatus = oldOrder[0]?.status;
        
        // Duruma göre ek alanları güncelle
        let updateFields = 'status = ?';
        let params = [status];
        
        if (status === 'shipped') {
            updateFields += ', shipped_date = NOW()';
            if (trackingNumber) {
                updateFields += ', tracking_number = ?';
                params.push(trackingNumber);
            }
            if (shippingCompany) {
                updateFields += ', shipping_company = ?';
                params.push(shippingCompany);
            }
        } else if (status === 'delivered') {
            updateFields += ', delivered_date = NOW()';
        }
        
        if (notes) {
            updateFields += ', notes = ?';
            params.push(notes);
        }
        
        params.push(orderId);
        
        // Sipariş durumunu güncelle
        await connection.execute(
            `UPDATE orders SET ${updateFields} WHERE id = ?`,
            params
        );
        
        // Durum geçmişine kaydet (eğer tablo varsa)
        try {
            await connection.execute(
                `INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, notes) 
                 VALUES (?, ?, ?, ?, ?)`,
                [orderId, oldStatus, status, adminId, notes || null]
            );
        } catch (historyErr) {
            // History tablosu yoksa devam et
            console.log("History tablosu bulunamadı, atlanıyor.");
        }
        
        await connection.commit();
        
        res.json({ 
            message: "Sipariş durumu başarıyla güncellendi.",
            oldStatus,
            newStatus: status
        });
        
    } catch (err) {
        if (connection) await connection.rollback();
        console.error("Güncelleme hatası:", err);
        res.status(500).json({ error: "Güncelleme hatası." });
    } finally {
        if (connection) connection.release();
    }
};

// Tek bir siparişin detayını getir
const getOrderDetail = async (req, res) => {
    const { id } = req.params;
    try {
        const [orderRows] = await db.execute(`
            SELECT 
                o.*, 
                u.id as user_id,
                u.full_name, 
                u.email, 
                u.phone_number
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        `, [id]);
        
        if (orderRows.length === 0) {
            return res.status(404).json({ error: "Sipariş bulunamadı." });
        }
        
        const [itemsRows] = await db.execute(`
            SELECT 
                oi.*, 
                p.id as product_id,
                p.name as product_name, 
                p.image_url,
                p.category,
                (oi.quantity * oi.unit_price) as total
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [id]);
        
        // History varsa çek
        let historyRows = [];
        try {
            [historyRows] = await db.execute(`
                SELECT h.*, u.full_name as changed_by_name
                FROM order_status_history h
                LEFT JOIN users u ON h.changed_by = u.id
                WHERE h.order_id = ?
                ORDER BY h.created_at DESC
            `, [id]);
        } catch (err) {
            console.log("History tablosu bulunamadı");
        }
        
        res.json({
            order: orderRows[0],
            items: itemsRows,
            history: historyRows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Sipariş detayı alınamadı." });
    }
};

// Kullanıcının kendi siparişlerini takip etmesi için
const getUserOrders = async (req, res) => {
    const userId = req.user.id;
    try {
        const [orders] = await db.execute(`
            SELECT 
                o.*,
                (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as total_items
            FROM orders o
            WHERE o.user_id = ?
            ORDER BY o.order_date DESC
        `, [userId]);
        
        // Her sipariş için ürünleri çek
        const ordersWithItems = [];
        for (const order of orders) {
            const [items] = await db.execute(`
                SELECT oi.*, p.name as product_name
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `, [order.id]);
            ordersWithItems.push({ ...order, items });
        }
        
        res.json(ordersWithItems);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Siparişler alınamadı." });
    }
};

module.exports = { 
    getAdminOrders, 
    updateOrderStatus, 
    getOrderDetail,
    getUserOrders
};