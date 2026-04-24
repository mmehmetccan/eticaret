// src/config/mail.js
const nodemailer = require('nodemailer');

// Mail transporter oluştur
const createTransporter = () => {
    // Gmail için
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    
    // Özel SMTP ayarları için
    if (process.env.SMTP_HOST) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    
    // Ethereal.email (test için - gerçek mail göndermez)
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: 'your-ethereal-username@ethereal.email',
            pass: 'your-ethereal-password'
        }
    });
};

const transporter = createTransporter();

// Genel mail gönderme fonksiyonu
const sendMail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"MCGShop" <${process.env.EMAIL_USER || 'noreply@mcgshop.com'}>`,
            to: to,
            subject: subject,
            text: text,
            html: html
        });
        
        console.log("✅ Mail gönderildi:", info.messageId);
        
        // Ethereal kullanıyorsanız, önizleme URL'ini göster
        if (info.messageId && transporter.options?.host === 'smtp.ethereal.email') {
            console.log("📧 Önizleme URL:", nodemailer.getTestMessageUrl(info));
        }
        
        return info;
    } catch (error) {
        console.error("❌ Mail gönderim hatası:", error);
        throw error;
    }
};

// Doğrulama kodu gönderme (YENİ)
const sendVerificationCode = async (email, code) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4f46e5;">MCGShop</h1>
            </div>
            <div style="background: #f8fafc; border-radius: 16px; padding: 30px; text-align: center;">
                <h2 style="color: #1e293b; margin-bottom: 20px;">E-posta Doğrulama</h2>
                <p style="color: #475569; margin-bottom: 20px;">MCGShop'a hoş geldiniz! Hesabınızı doğrulamak için aşağıdaki kodu kullanın:</p>
                <div style="background: white; border: 2px solid #e2e8f0; border-radius: 12px; padding: 15px; font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #4f46e5; margin: 20px 0;">
                    ${code}
                </div>
                <p style="color: #64748b; font-size: 14px;">Bu kod <strong>10 dakika</strong> geçerlidir.</p>
                <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">Eğer bu talebi siz yapmadıysanız, bu e-postayı dikkate almayın.</p>
            </div>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="color: #94a3b8; font-size: 12px;">© 2024 MCGShop. Tüm hakları saklıdır.</p>
            </div>
        </div>
    `;

    const text = `Doğrulama kodunuz: ${code} (10 dakika geçerlidir)`;

    return sendMail(email, "MCGShop - E-posta Doğrulama Kodu", text, html);
};

module.exports = { sendMail, sendVerificationCode };