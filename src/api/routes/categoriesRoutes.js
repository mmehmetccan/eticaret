// routes/categories.js

const express = require('express');
const router = express.Router();

// Kategorileri getir (HERKES)
router.get('/', async (req, res) => {
  try {
    const [categories] = await req.db.query('SELECT * FROM categories ORDER BY id');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Yeni kategori ekle (ADMIN)
router.post('/admin/categories', async (req, res) => {
  try {
    const { name, icon, active } = req.body;
    const [result] = await req.db.query(
      'INSERT INTO categories (name, icon, active) VALUES (?, ?, ?)',
      [name, icon, active !== false ? 1 : 0]
    );
    res.json({ id: result.insertId, name, icon, active });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kategori güncelle (ADMIN)
router.put('/admin/categories/:id', async (req, res) => {
  try {
    const { name, icon, active } = req.body;
    await req.db.query(
      'UPDATE categories SET name = ?, icon = ?, active = ? WHERE id = ?',
      [name, icon, active !== false ? 1 : 0, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kategori sil (ADMIN)
router.delete('/admin/categories/:id', async (req, res) => {
  try {
    await req.db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;