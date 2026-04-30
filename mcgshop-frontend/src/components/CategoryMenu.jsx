// components/CategoryMenu.jsx

import { useState, useEffect } from 'react';
import api from '../api/api';

const CategoryMenu = () => {
  const [mainCategories, setMainCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        // Sadece aktif olan kategorileri göster
        setMainCategories(res.data.filter(c => c.active === 1 || c.active === true));
      } catch (err) {
        console.error("Kategoriler yüklenemedi:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  if (loading) return <div>Kategoriler yükleniyor...</div>;

  return (
    <div className="category-menu">
      {mainCategories.map(category => (
        <a 
          key={category.id} 
          href={`/category/${category.name.toLowerCase()}`}
          className="category-item"
        >
          <span className="category-icon">{category.icon || '📁'}</span>
          <span className="category-name">{category.name}</span>
        </a>
      ))}
    </div>
  );
};

export default CategoryMenu;