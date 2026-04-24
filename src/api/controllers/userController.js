const jwt = require('jsonwebtoken');
const db = require('../../config/db');
const bcrypt = require('bcrypt');
const { get } = require('../routes/productRoutes');
const { sendVerificationCode } = require('../../config/mail');

const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};


const register = async (req, res) => {
    const { email, password, full_name, phone_number, gender, birth_date } = req.body;
    
    try {
        // E-posta kontrolü
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: "Bu e-posta zaten kullanımda." });
        }
        
        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Doğrulama kodu oluştur
        const verificationCode = generateVerificationCode();
        const codeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 dakika
        
        // Kullanıcıyı kaydet (email_verified = FALSE)
        const query = `INSERT INTO users 
            (email, password_hash, full_name, phone_number, gender, birth_date, 
             verification_code, verification_code_expires, email_verified) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        await db.execute(query, [
            email, hashedPassword, full_name, phone_number || null, 
            gender || null, birth_date || null,
            verificationCode, codeExpires, false
        ]);
        
        // Doğrulama kodunu e-posta ile gönder
        await sendVerificationCode(email, verificationCode);
        
        res.status(201).json({ 
            message: "Kayıt başarılı! E-posta adresinize doğrulama kodu gönderildi.",
            email: email
        });
        
    } catch (err) {
        console.error("Kayıt hatası:", err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "Bu e-posta zaten kullanımda." });
        }
        res.status(500).json({ error: "Kayıt sırasında bir hata oluştu." });
    }
};

// ==================== E-POSTA DOĞRULAMA ====================
const verifyEmail = async (req, res) => {
    const { email, code } = req.body;
    
    try {
        const [users] = await db.execute(
            `SELECT id, verification_code, verification_code_expires, email_verified 
             FROM users WHERE email = ?`,
            [email]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ error: "Kullanıcı bulunamadı." });
        }
        
        const user = users[0];
        
        if (user.email_verified) {
            return res.status(400).json({ error: "Hesap zaten doğrulanmış." });
        }
        
        if (user.verification_code !== code) {
            return res.status(400).json({ error: "Geçersiz doğrulama kodu." });
        }
        
        if (new Date() > new Date(user.verification_code_expires)) {
            return res.status(400).json({ error: "Doğrulama kodunun süresi dolmuş. Yeni kod isteyin." });
        }
        
        // Hesabı doğrula
        await db.execute(
            `UPDATE users SET email_verified = TRUE, verification_code = NULL, 
             verification_code_expires = NULL, email_verified_at = NOW() 
             WHERE id = ?`,
            [user.id]
        );
        
        res.json({ message: "E-posta başarıyla doğrulandı! Şimdi giriş yapabilirsiniz." });
        
    } catch (err) {
        console.error("Doğrulama hatası:", err);
        res.status(500).json({ error: "Doğrulama sırasında bir hata oluştu." });
    }
};


const resendVerificationCode = async (req, res) => {
    const { email } = req.body;
    
    try {
        const [users] = await db.execute(
            `SELECT id, email_verified FROM users WHERE email = ?`,
            [email]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ error: "Kullanıcı bulunamadı." });
        }
        
        if (users[0].email_verified) {
            return res.status(400).json({ error: "Hesap zaten doğrulanmış." });
        }
        
        const newCode = generateVerificationCode();
        const newExpires = new Date(Date.now() + 10 * 60 * 1000);
        
        await db.execute(
            `UPDATE users SET verification_code = ?, verification_code_expires = ? WHERE id = ?`,
            [newCode, newExpires, users[0].id]
        );
        
        await sendVerificationCode(email, newCode);
        
        res.json({ message: "Yeni doğrulama kodu e-posta adresinize gönderildi." });
        
    } catch (err) {
        console.error("Yeniden gönderme hatası:", err);
        res.status(500).json({ error: "Kod gönderilirken bir hata oluştu." });
    }
};

// ==================== DOĞRULAMA DURUMU KONTROLÜ ====================
const checkVerificationStatus = async (req, res) => {
    const { email } = req.params;
    
    try {
        const [users] = await db.execute(
            'SELECT email_verified FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ error: "Kullanıcı bulunamadı." });
        }
        
        res.json({ 
            email_verified: users[0].email_verified === 1,
            email: email
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Durum kontrol edilemedi." });
    }
};

// ==================== GİRİŞ (Doğrulanmamış Hesap Kontrolü) ====================
// MEVCUT login fonksiyonunun YERİNE bunu koyun
const login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];
        
        if (!user) {
            return res.status(401).json({ error: "E-posta veya şifre hatalı." });
        }
        
        // Hesap doğrulanmış mı?
        if (!user.email_verified) {
            return res.status(403).json({ 
                error: "Hesabınız doğrulanmamış. Lütfen e-posta adresinizi doğrulayın.",
                needsVerification: true,
                email: user.email
            });
        }
        
        if (!(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: "E-posta veya şifre hatalı." });
        }
        
        const token = jwt.sign(
            { 
                id: user.id, 
                role: user.role?.toLowerCase(),
                full_name: user.full_name 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
        );
        
        console.log("🔐 Token oluşturuldu. Rol:", user.role?.toLowerCase());
        
        res.json({ 
            token, 
            user: { 
                id: user.id, 
                full_name: user.full_name, 
                email: user.email,
                role: user.role?.toLowerCase() 
            } 
        });
        
    } catch (err) {
        console.error("Login hatası:", err);
        res.status(500).json({ error: "Giriş yapılamadı." });
    }
};

// src/api/controllers/userController.js - updateProfile fonksiyonu
const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { full_name, email, phone_number, gender, birth_date, current_password, new_password, confirm_password } = req.body;

    try {
        // Sadece profil bilgilerini güncelle (şifre yoksa)
        if (!new_password) {
            const query = `
                UPDATE users 
                SET full_name = ?, email = ?, phone_number = ?, gender = ?, birth_date = ? 
                WHERE id = ?
            `;
            const values = [full_name, email, phone_number || null, gender || null, birth_date || null, userId];
            await db.execute(query, values);
            
            return res.json({ message: "Profil başarıyla güncellendi!" });
        }

        // Şifre değiştirme işlemi
        // Önce mevcut şifreyi kontrol et
        const [userRows] = await db.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);
        
        if (userRows.length === 0) {
            return res.status(404).json({ error: "Kullanıcı bulunamadı." });
        }
        
        const user = userRows[0];
        
        // Mevcut şifre doğru mu?
        const isPasswordValid = await bcrypt.compare(current_password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Mevcut şifreniz yanlış!" });
        }
        
        // Yeni şifre ve onay şifresi eşleşiyor mu?
        if (new_password !== confirm_password) {
            return res.status(400).json({ error: "Yeni şifre ve onay şifresi eşleşmiyor!" });
        }
        
        // Şifre uzunluğu kontrolü
        if (new_password.length < 6) {
            return res.status(400).json({ error: "Şifre en az 6 karakter olmalıdır!" });
        }
        
        // Yeni şifreyi hashle
        const hashedPassword = await bcrypt.hash(new_password, 10);
        
        // Profil ve şifreyi güncelle
        const query = `
            UPDATE users 
            SET full_name = ?, email = ?, phone_number = ?, gender = ?, birth_date = ?, password_hash = ? 
            WHERE id = ?
        `;
        const values = [full_name, email, phone_number || null, gender || null, birth_date || null, hashedPassword, userId];
        await db.execute(query, values);
        
        res.json({ message: "Profil ve şifre başarıyla güncellendi!" });
        
    } catch (err) {
        console.error("Güncelleme hatası:", err);
        
        // E-posta tekrar hatası
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "Bu e-posta adresi zaten kullanımda!" });
        }
        
        // Diğer hatalar
        res.status(500).json({ error: "Güncelleme sırasında bir hata oluştu: " + err.message });
    }
};

// src/api/controllers/userController.js içindeki getMyOrders fonksiyonu
const getMyOrders = async (req, res) => {
    try {
        const query = `
            SELECT 
                o.id, 
                o.total_price, 
                o.status, 
                o.order_date, 
                o.shipping_address,
                o.city,
                o.district,
                o.zip_code,
                o.shipping_method,
                o.installment,
                o.tracking_number,
                o.shipping_company,
                o.shipped_date,
                o.delivered_date,
                (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as total_items
            FROM orders o
            WHERE o.user_id = ?
            ORDER BY o.order_date DESC
        `;
        
        const [orders] = await db.execute(query, [req.user.id]);

        // Her sipariş için ürünleri çek
        const ordersWithItems = [];
        for (const order of orders) {
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
            
            ordersWithItems.push({
                ...order,
                items: items
            });
        }

        return res.json(ordersWithItems);

    } catch (err) {
        console.error("KRİTİK HATA:", err.message);
        return res.status(500).json({ error: "Siparişler yüklenirken bir hata oluştu." });
    }
};
const getProfile = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, full_name, email, phone_number FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Kullanıcı bulunamadı" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Sunucu hatası" });
    }
};

const toggleFavorite = async (req, res) => {
    const { productId } = req.body;
    const userId = req.user.id;

    if (!productId) {
        return res.status(400).json({ error: "Ürün ID gerekli." });
    }

    try {
        // Önce ürünün var olduğunu kontrol et
        const [product] = await db.execute('SELECT id FROM products WHERE id = ?', [productId]);
        if (product.length === 0) {
            return res.status(404).json({ error: "Ürün bulunamadı." });
        }

        // Favoride var mı kontrol et
        const [exists] = await db.execute(
            'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (exists.length > 0) {
            // Varsa sil
            await db.execute(
                'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
                [userId, productId]
            );
            return res.json({ message: "Favorilerden çıkarıldı", isFavorite: false });
        } else {
            // Yoksa ekle
            await db.execute(
                'INSERT INTO favorites (user_id, product_id) VALUES (?, ?)',
                [userId, productId]
            );
            return res.json({ message: "Favorilere eklendi", isFavorite: true });
        }
    } catch (err) {
        console.error("Favori hatası:", err);
        res.status(500).json({ error: "İşlem başarısız: " + err.message });
    }
};


// Favorileri listele
const getFavorites = async (req, res) => {
    const userId = req.user.id;

    try {
        const [rows] = await db.execute(
            `SELECT p.*, 
                    (SELECT image_url FROM product_images WHERE product_id = p.id AND is_main = TRUE LIMIT 1) as main_image
             FROM products p 
             JOIN favorites f ON p.id = f.product_id 
             WHERE f.user_id = ?
             ORDER BY f.created_at DESC`,
            [userId]
        );
        
        // Her ürün için image_url düzenlemesi
        const favorites = rows.map(product => ({
            ...product,
            image_url: product.main_image || product.image_url || null
        }));
        
        res.json(favorites);
    } catch (err) {
        console.error("Favoriler getirme hatası:", err);
        res.status(500).json({ error: "Favoriler yüklenemedi" });
    }
};

// Tek bir ürünün favori durumunu kontrol et
const checkFavorite = async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id;

    try {
        const [exists] = await db.execute(
            'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );
        res.json({ isFavorite: exists.length > 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Kontrol başarısız" });
    }
};

// TÜM FONKSİYONLARI TEK TEK EXPORT ET
module.exports.register = register;
module.exports.login = login;
module.exports.updateProfile = updateProfile;
module.exports.getMyOrders = getMyOrders;
module.exports.getProfile=getProfile;
module.exports.getFavorites=getFavorites;
module.exports.toggleFavorite=toggleFavorite;
module.exports.checkFavorite=checkFavorite;
module.exports.verifyEmail=verifyEmail;
module.exports.resendVerificationCode=resendVerificationCode;
module.exports.checkVerificationStatus=checkVerificationStatus;