const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: "Token bulunamadı. Lütfen giriş yapın." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log("✅ Token çözüldü:", req.user); // DEBUG için
        next();
    } catch (err) {
        console.error("Token hatası:", err.message);
        return res.status(403).json({ error: "Geçersiz veya süresi dolmuş token." });
    }
};

const optionalAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch (err) {
            // Token geçersiz olsa bile devam et
            console.log("Geçersiz token:", err.message);
        }
    }
    next();
};

const isAdmin = (req, res, next) => {
    // Kullanıcı bilgisi token'dan gelmeli (verifyToken önce çalışmalı)
    if (!req.user) {
        return res.status(401).json({ error: "Önce giriş yapmalısınız." });
    }
    
    // Küçük-büyük harf duyarsız kontrol
    const userRole = req.user.role?.toLowerCase();
    const adminRole = 'admin';
    
    console.log("🔍 Rol kontrolü:", { userRole, isAdmin: userRole === adminRole }); // DEBUG için
    
    if (userRole === adminRole) {
        next();
    } else {
        res.status(403).json({ error: "Bu alana sadece yöneticiler girebilir." });
    }
};

// Alternatif: Daha esnek kontrol
const isAdminV2 = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "Önce giriş yapmalısınız." });
    }
    
    // 'admin', 'Admin', 'ADMIN' hepsini kabul et
    if (req.user.role === 'admin' || req.user.role === 'Admin' || req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ error: "Bu alana sadece yöneticiler girebilir." });
    }
};

module.exports = { verifyToken, isAdmin, isAdminV2, optionalAuth };