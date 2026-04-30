// src/pages/CategoryProducts.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { toast } from 'react-toastify';
import { formatPrice, formatDiscountedPrice, getImageUrl } from '../utils/formatPrice';

import { ShoppingCart, Heart, AlertCircle, Star, Truck, Filter, X, ChevronDown } from 'lucide-react';

const CategoryProducts = () => {
  const { type } = useParams(); // 'discounted', 'new', 'freeshipping', 'recommended'
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Kategori bilgileri
  const categoryInfo = {
    discounted: {
      title: 'Kaçırma Fırsatları',
      subtitle: 'İndirimli ürünler',
      icon: '🔥',
      color: '#ef4444',
      filter: (p) => p.discount > 0
    },
    new: {
      title: 'Yeni Ürünler',
      subtitle: 'Yeni sezon ürünleri',
      icon: '✨',
      color: '#10b981',
      filter: (p) => p.is_new === 1 || p.is_new === true
    },
    recommended: {
      title: 'Önerilen Ürünler',
      subtitle: 'İlginizi çekebilecek ürünler',
      icon: '🎯',
      color: '#8b5cf6',
      filter: (p) => p.discount === 0 && p.is_new !== 1 && p.is_new !== true && p.free_shipping !== 1 && p.free_shipping !== true
    },
    freeshipping: {
      title: 'Kargo Bedava Ürünler',
      subtitle: 'Ücretsiz kargo fırsatı',
      icon: '🚚',
      color: '#f59e0b',
      filter: (p) => p.free_shipping === 1 || p.free_shipping === true
    }
  };

  // Sıralama seçenekleri
  const sortOptions = [
    { value: 'default', label: 'Önerilen', icon: '✨' },
    { value: 'bestseller', label: 'En Çok Satanlar', icon: '🏆' },
    { value: 'price_asc', label: 'Fiyata Göre Artan', icon: '📈' },
    { value: 'price_desc', label: 'Fiyata Göre Azalan', icon: '📉' },
    { value: 'rating', label: 'En Yüksek Puanlılar', icon: '⭐' },
    { value: 'newest', label: 'En Yeniler', icon: '🆕' },
    { value: 'discount', label: 'En Çok İndirim', icon: '🔥' }
  ];

  const getSortLabel = () => {
    const option = sortOptions.find(opt => opt.value === sortBy);
    return option ? `${option.icon} ${option.label}` : '✨ Önerilen';
  };

  const currentCategory = categoryInfo[type] || categoryInfo.recommended;

  useEffect(() => {
    fetchProducts();
  }, [type]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, sortBy, priceRange]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      const allProducts = res.data;
      const filtered = allProducts.filter(currentCategory.filter);
      setProducts(filtered);
      
      // Fiyat aralığını güncelle
      if (filtered.length > 0) {
        const prices = filtered.map(p => p.price);
        setPriceRange({
          min: Math.min(...prices),
          max: Math.max(...prices)
        });
      }
    } catch (err) {
      console.error("Ürünler yüklenemedi", err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let result = [...products];
    
    // Fiyat aralığı filtresi
    result = result.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);
    
    // Sıralama
    switch(sortBy) {
      case 'bestseller':
        result.sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0));
        break;
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'discount':
        result.sort((a, b) => b.discount - a.discount);
        break;
      default:
        result.sort((a, b) => b.id - a.id);
        break;
    }
    
    setFilteredProducts(result);
  };

  const addToCart = async (product, e) => {
  e.preventDefault();
  e.stopPropagation();
  if (product.stock_quantity <= 0) {
    toast.error('❌ Bu ürün tükendi!');
    return;
  }
  const token = localStorage.getItem('token');
  if (!token) {
    toast.error('⚠️ Sepete eklemek için giriş yapmalısınız!');
    setTimeout(() => navigate('/login'), 1500);
    return;
  }
  try {
    await api.post('/cart/add', { productId: product.id, quantity: 1 });
    toast.success(`🎉 ${product.name} sepete eklendi!`);
  } catch (err) {
    toast.error(err.response?.data?.error || '❌ Bir hata oluştu.');
  }
};

  const toggleFavorite = async (productId, e) => {
  e.preventDefault();
  e.stopPropagation();
  if (!user) {
    toast.error('❤️ Favorilere eklemek için giriş yapmalısınız!');
    setTimeout(() => navigate('/login'), 1500);
    return;
  }
  try {
    const response = await api.post('/users/favorites/toggle', { productId });
    setFilteredProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? { ...p, isFavorite: response.data.isFavorite }
          : p
      )
    );
    if (response.data.isFavorite) {
      toast.success('❤️ Favorilere eklendi!');
    } else {
      toast.error('💔 Favorilerden çıkarıldı');
    }
  } catch (err) {
    toast.error('Favori işlemi başarısız!');
  }
};

  const getRatingValue = (rating) => {
    const num = parseFloat(rating);
    return isNaN(num) ? 0 : num;
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'B';
    return num.toString();
  };

  const getDiscountedPrice = (price, discount) => {
    if (!discount || discount === 0) return null;
    return price - (price * discount / 100);
  };

  if (loading) {
    return (
      <div className="category-products-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-products-page">
      {/* Header */}
      <div className="category-products-header" style={{ background: `linear-gradient(135deg, ${currentCategory.color}, ${currentCategory.color}dd)` }}>
        <div className="category-products-header-content">
          <div className="category-products-icon">{currentCategory.icon}</div>
          <h1 className="category-products-title">{currentCategory.title}</h1>
          <p className="category-products-subtitle">{currentCategory.subtitle}</p>
          <p className="category-products-count">{filteredProducts.length} ürün bulundu</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="category-products-filters">
        <div className="filters-left">
          <button className="filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} />
            Filtrele
          </button>
          
          {/* Sıralama Dropdown */}
          <div className="sort-dropdown-container">
            <button 
              className="sort-dropdown-btn"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
            >
              <span>{getSortLabel()}</span>
              <ChevronDown size={16} className={`sort-arrow ${showSortDropdown ? 'rotate' : ''}`} />
            </button>
            {showSortDropdown && (
              <div className="sort-dropdown-menu">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    className={`sort-option ${sortBy === option.value ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowSortDropdown(false);
                    }}
                  >
                    <span className="sort-option-icon">{option.icon}</span>
                    <span>{option.label}</span>
                    {sortBy === option.value && <span className="sort-option-check">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {showFilters && (
            <div className="filters-panel">
              <div className="filter-group">
                <label>Fiyat Aralığı</label>
                <div className="price-range">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="filters-right">
          <span className="result-count">{filteredProducts.length} sonuç</span>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <p>Bu kategoride henüz ürün bulunmuyor.</p>
          <button onClick={() => navigate('/')} className="back-home-btn">Ana Sayfaya Dön</button>
        </div>
      ) : (
        <div className="category-products-grid">
          {filteredProducts.map((product) => {
             const isOutOfStock = product.stock_quantity <= 0;

             const hasDiscount = product.discount > 0;

            const isNew = product.is_new === 1 || product.is_new === true;

const hasFreeShipping = product.free_shipping === 1 || product.free_shipping === true;
  const discountedPrice = getDiscountedPrice(product.price, product.discount);
  const avgRating = getRatingValue(product.avg_rating || product.rating);
  const totalReviews = product.total_reviews || product.rating_count || 0;
  const isFavorite = product.isFavorite || false;

            return (
    <Link key={product.id} to={`/product/${product.id}`} className="category-product-card">
      {/* Rozetleri (badges) buraya, Link içine alıyoruz */}
      {hasDiscount && !isOutOfStock && (
        <div className="cat-discount-badge" style={{ top: '12px', left: '12px', position: 'absolute' }}>
          -%{product.discount}
        </div>
      )}

      {/* isNew kullanımı burada güvenli */}
      {isNew && !isOutOfStock && !hasDiscount && (
        <div className="cat-new-badge" style={{ 
          top: hasDiscount ? '52px' : '12px', 
          left: '12px', 
          position: 'absolute' 
        }}>
          Yeni
        </div>
      )}

{hasFreeShipping && !isOutOfStock && (
  <div className="cat-cargo-badge-top" style={{ 
    top: hasDiscount ? (isNew ? '92px' : '52px') : (isNew ? '52px' : '12px'),
    left: '12px', 
    position: 'absolute' 
  }}>
    <Truck size={12} /> Kargo Bedava
  </div>
)}

                {/* Favori Butonu */}
                <button 
                  className={`cat-favorite-btn ${isFavorite ? 'favorite-active' : ''}`}
                  onClick={(e) => toggleFavorite(product.id, e)}
                >
                  <Heart size={18} fill={isFavorite ? "white" : "none"} />
                </button>

                {/* Resim */}
                <div className="cat-product-image-wrapper">
                  <img 
  src={getImageUrl(product.image_url)} 
  alt={product.name}
  className="cat-product-image"
/>
                  {isOutOfStock && (
                    <div className="cat-outstock-overlay">
                      <span className="cat-outstock-text">Tükendi</span>
                    </div>
                  )}
                </div>

                {/* Bilgiler */}
                <div className="cat-product-info">
                  <div className="cat-product-prices">
                    {hasDiscount && !isOutOfStock ? (
                      <>
                        <span className="cat-price-original">{formatPrice(product.price)} TL</span>
      <span className="cat-price-discount">{formatDiscountedPrice(product.price, product.discount)} TL</span>
    </>
  ) : (
    <span className="cat-price-current">{formatPrice(product.price)} TL</span>
                    )}
                  </div>

                  <h3 className="cat-product-name">{product.name}</h3>

                  <p className="cat-product-description">
                    {product.description?.substring(0, 80) || "Premium kalite ürün"}
                    {product.description?.length > 80 && "..."}
                  </p>

                  <div className="cat-product-stats">
                    <div className="cat-product-rating">
                      <Star size={14} fill="#f59e0b" color="#f59e0b" />
                      <span className="cat-rating-value">{avgRating.toFixed(1)}</span>
                      <span className="cat-rating-count">({formatNumber(totalReviews)})</span>
                    </div>
                  </div>

                  <button 
                    className="cat-add-to-cart-btn"
                    disabled={isOutOfStock}
                    onClick={(e) => addToCart(product, e)}
                  >
                    {isOutOfStock ? 'Tükendi' : 'Sepete Ekle'}
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        .category-products-page {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 20px 40px;
          min-height: calc(100vh - 80px);
        }

        .category-products-header {
          border-radius: 32px;
          padding: 60px 40px;
          margin-bottom: 40px;
          text-align: center;
        }

        .category-products-header-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .category-products-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .category-products-title {
          font-size: 36px;
          font-weight: 900;
          color: white;
          margin-bottom: 8px;
        }

        .category-products-subtitle {
          font-size: 16px;
          color: rgba(255,255,255,0.9);
          margin-bottom: 16px;
        }

        .category-products-count {
          font-size: 14px;
          color: rgba(255,255,255,0.7);
        }

        .category-products-filters {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .filters-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .filter-toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .filter-toggle-btn:hover {
          border-color: #4f46e5;
          color: #4f46e5;
        }

        /* Sıralama Dropdown Stilleri */
        .sort-dropdown-container {
          position: relative;
        }

        .sort-dropdown-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 40px;
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
          transition: all 0.3s;
        }

        .sort-dropdown-btn:hover {
          border-color: #4f46e5;
          background: #f8fafc;
        }

        .sort-arrow {
          transition: transform 0.3s;
        }

        .sort-arrow.rotate {
          transform: rotate(180deg);
        }

        .sort-dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 8px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
          min-width: 220px;
          z-index: 100;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }

        .sort-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          width: 100%;
          background: none;
          border: none;
          font-size: 13px;
          font-weight: 500;
          color: #334155;
          cursor: pointer;
          transition: background 0.2s;
          text-align: left;
        }

        .sort-option:hover {
          background: #f8fafc;
        }

        .sort-option.active {
          background: #eef2ff;
          color: #4f46e5;
        }

        .sort-option-icon {
          font-size: 16px;
        }

        .sort-option-check {
          margin-left: auto;
          color: #4f46e5;
          font-weight: 700;
        }

        .cat-badges-top-left {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
}

/* TÜM ROZET ORTAK STİLLERİ */
.cat-discount-badge,
.cat-new-badge,
.cat-cargo-badge-top {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 30px;
  font-weight: 800;
  width: fit-content;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  letter-spacing: 0.5px;
}

/* İNDİRİM ROZETİ */
.cat-discount-badge {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 12px;
}

/* YENİ ÜRÜN ROZETİ */
.cat-new-badge {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-size: 12px;
}

/* KARGO BEDAVA ROZETİ */
.cat-cargo-badge-top {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  font-size: 11px;
}

        .filters-panel {
          display: flex;
          gap: 20px;
          background: white;
          padding: 16px 24px;
          border-radius: 40px;
          border: 1px solid #e2e8f0;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .filter-group label {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          color: #94a3b8;
        }

        .price-range {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .price-range input {
          width: 100px;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 13px;
          outline: none;
        }

        .result-count {
          font-size: 13px;
          color: #64748b;
        }

        .category-products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 25px;
        }

        .category-product-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          transition: transform 0.3s, box-shadow 0.3s;
          text-decoration: none;
          display: block;
          position: relative;
        }

        .category-product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.15);
        }

        .cat-product-image-wrapper {
          position: relative;
          height: 280px;
          background: #f8fafc;
          overflow: hidden;
        }

        .cat-product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .category-product-card:hover .cat-product-image {
          transform: scale(1.05);
        }

        .cat-discount-badge,
        .cat-new-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 800;
          z-index: 2;
        }

        .cat-discount-badge {
          background: #ef4444;
          color: white;
        }

        .cat-new-badge {
          background: #10b981;
          color: white;
        }

        .cat-cargo-badge {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(0,0,0,0.7);
          color: white;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 5px;
          z-index: 2;
        }

        .cat-favorite-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: white;
          border: none;
          border-radius: 50%;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .favorite-active {
          background: #ef4444;
          color: white;
        }

        .cat-outstock-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .cat-outstock-text {
          background: white;
          padding: 6px 16px;
          border-radius: 30px;
          font-weight: 800;
          font-size: 12px;
        }

        .cat-product-info {
          padding: 15px;
        }

        .cat-product-prices {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 8px;
        }

        .cat-price-original {
          font-size: 13px;
          color: #94a3b8;
          text-decoration: line-through;
        }

        .cat-price-discount {
          font-size: 20px;
          font-weight: 900;
          color: #ef4444;
        }

        .cat-price-current {
          font-size: 20px;
          font-weight: 900;
          color: #1a1a2e;
        }

        .cat-product-name {
          font-size: 15px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 6px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 42px;
        }

        .cat-product-description {
          font-size: 12px;
          color: #64748b;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .cat-product-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 8px 0;
        }

        .cat-product-rating {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .cat-rating-value {
          font-size: 13px;
          font-weight: 700;
          color: #f59e0b;
        }

        .cat-rating-count {
          font-size: 11px;
          color: #94a3b8;
        }

        .cat-add-to-cart-btn {
          width: 100%;
          background: #1a1a2e;
          color: white;
          padding: 10px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          border: none;
          margin-top: 10px;
          transition: background 0.3s;
        }

        .cat-add-to-cart-btn:hover:not(:disabled) {
          background: #667eea;
        }

        .cat-add-to-cart-btn:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
        }

        .no-products {
          text-align: center;
          padding: 80px 20px;
          background: white;
          border-radius: 32px;
        }

        .no-products p {
          font-size: 18px;
          color: #64748b;
          margin-bottom: 20px;
        }

        .back-home-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 12px 32px;
          border-radius: 40px;
          font-weight: 700;
          border: none;
          cursor: pointer;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #e2e8f0;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .category-products-header {
            padding: 40px 24px;
          }
          .category-products-title {
            font-size: 28px;
          }
          .filters-panel {
            flex-direction: column;
            width: 100%;
          }
          .category-products-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 15px;
          }
          .cat-product-image-wrapper {
            height: 240px;
          }
        }
      `}</style>
    </div>
  );
};

export default CategoryProducts;