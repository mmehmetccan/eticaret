const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Klasör yoksa otomatik oluşturma mantığı
// Docker içindeki köprü kurduğumuz /app/uploads klasörüne doğrudan gider
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Kesin yolu buraya veriyoruz
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
module.exports = upload;