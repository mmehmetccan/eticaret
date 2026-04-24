// src/api/controllers/authController.js
const db = require('../../config/db');
const crypto = require('crypto');
const sendMail = require('../../config/mail');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5174';


// Şifre Sıfırlama İsteği Oluşturma
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: "E-posta adresi gereklidir." });
    }
    
    try {
        // Kullanıcı var mı kontrol et
        const [users] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            // Güvenlik için e-posta bulunamasa da aynı mesajı gönder
            return res.json({ message: "Şifre sıfırlama talimatları e-postanıza gönderildi." });
        }
        
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 saat
        
        await db.execute(
            'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE email = ?',
            [token, expires, email]
        );
        
const resetLink = `${FRONTEND_URL}/reset-password/${token}`;
        
        await sendMail(
            email,
            "MCGShop - Şifre Sıfırlama Talebi",
            `Şifrenizi sıfırlamak için şu linke tıklayın: ${resetLink}`,
            `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #4f46e5;">MCGShop</h1>
                    <p>Şifre sıfırlama talebinde bulundunuz.</p>
                    <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
                    <a href="${resetLink}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Şifremi Sıfırla</a>
                    <p>Bu bağlantı <strong>1 saat</strong> geçerlidir.</p>
                    <p>Eğer bu talebi siz yapmadıysanız, bu e-postayı dikkate almayın.</p>
                    <hr style="margin: 30px 0; border-color: #e2e8f0;">
                    <p style="color: #94a3b8; font-size: 12px;">MCGShop Ekibi</p>
                </div>
            `
        );
        
        res.json({ message: "Şifre sıfırlama talimatları e-postanıza gönderildi." });
        
    } catch (err) {
        console.error("Şifre sıfırlama hatası:", err);
        res.status(500).json({ error: "İşlem sırasında bir hata oluştu." });
    }
};

// Şifre Sıfırlama (Token ile)
const resetPassword = async (req, res) => {
    const { token, new_password } = req.body;
    const bcrypt = require('bcrypt');
    
    try {
        // Token'ı kontrol et
        const [users] = await db.execute(
            'SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()',
            [token]
        );
        
        if (users.length === 0) {
            return res.status(400).json({ error: "Geçersiz veya süresi dolmuş bağlantı." });
        }
        
        // Şifre uzunluğu kontrolü
        if (new_password.length < 6) {
            return res.status(400).json({ error: "Şifre en az 6 karakter olmalıdır!" });
        }
        
        const hashedPassword = await bcrypt.hash(new_password, 10);
        
        await db.execute(
            'UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
            [hashedPassword, users[0].id]
        );
        
        res.json({ message: "Şifreniz başarıyla sıfırlandı!" });
        
    } catch (err) {
        console.error("Şifre sıfırlama hatası:", err);
        res.status(500).json({ error: "İşlem sırasında bir hata oluştu." });
    }
};

module.exports = { forgotPassword, resetPassword };