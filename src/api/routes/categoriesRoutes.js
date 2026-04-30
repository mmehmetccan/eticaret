const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Kategorileri getir (HERKES)
router.get('/', async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories ORDER BY id');
    res.json(categories);
  } catch (error) {
    console.error('Kategori getirme hatası:', error);
    res.status(500).json({ error: 'Kategoriler yüklenirken bir hata oluştu' });
  }
});

// Yeni kategori ekle (ADMIN)
router.post('/admin/categories', async (req, res) => {
  try {
    const { name, icon, active } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Kategori adı gereklidir' });
    }
    
    const [result] = await db.query(
      'INSERT INTO categories (name, icon, active) VALUES (?, ?, ?)',
      [name.trim(), icon || '📦', active !== false ? 1 : 0]
    );
    res.json({ id: result.insertId, name: name.trim(), icon: icon || '📦', active: active !== false });
  } catch (error) {
    console.error('Kategori ekleme hatası:', error);
    res.status(500).json({ error: 'Kategori eklenirken bir hata oluştu' });
  }
});

// Kategori güncelle (ADMIN)
router.put('/admin/categories/:id', async (req, res) => {
  try {
    const { name, icon, active } = req.body;
    await db.query(
      'UPDATE categories SET name = ?, icon = ?, active = ? WHERE id = ?',
      [name.trim(), icon || '📦', active !== false ? 1 : 0, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Kategori güncelleme hatası:', error);
    res.status(500).json({ error: 'Kategori güncellenirken bir hata oluştu' });
  }
});

// Kategori sil (ADMIN)
router.delete('/admin/categories/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Kategori silme hatası:', error);
    res.status(500).json({ error: 'Kategori silinirken bir hata oluştu' });
  }
});

module.exports = router;