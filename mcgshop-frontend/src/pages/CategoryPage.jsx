// src/pages/CategoryPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { toast } from 'react-toastify';
import { formatPrice, formatDiscountedPrice, getImageUrl } from '../utils/formatPrice';

import { ShoppingCart, Heart, AlertCircle, Star, Truck, Filter, ChevronDown } from 'lucide-react';
import '../styles/CategoryPage.css';

const CategoryPage = () => {
  const { categoryId, subCategoryId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Kategori isimleri
  const categoryNames = {
    kadin: 'Kadın',
    erkek: 'Erkek',
    cocuk: 'Çocuk',
    elektronik: 'Elektronik',
    'ev-yasam': 'Ev & Yaşam',
    kozmetik: 'Kozmetik',
    spor: 'Spor & Outdoor',
    kitap: 'Kitap & Kırtasiye'
  };

  // Alt kategori isimleri
  const subCategoryNames = {
    giyim: 'Giyim',
    elbise: 'Elbise',
    tisort: 'Tişört',
    gomlek: 'Gömlek',
    'kot-pantolon': 'Kot Pantolon',
    'kot-ceket': 'Kot Ceket',
    ayakkabi: 'Ayakkabı',
    canta: 'Çanta',
    aksesuar: 'Aksesuar',
    pantolon: 'Pantolon',
    ceket: 'Ceket',
    saat: 'Saat',
    cuzdan: 'Cüzdan',
    'kiz-cocuk': 'Kız Çocuk',
    'erkek-cocuk': 'Erkek Çocuk',
    bebek: 'Bebek',
    oyuncak: 'Oyuncak',
    'okul-kiyafetleri': 'Okul Kıyafetleri',
    telefon: 'Telefon',
    bilgisayar: 'Bilgisayar',
    tablet: 'Tablet',
    kulaklik: 'Kulaklık',
    'akilli-saat': 'Akıllı Saat',
    'oyun-konsolu': 'Oyun Konsolu',
    mobilya: 'Mobilya',
    dekorasyon: 'Dekorasyon',
    mutfak: 'Mutfak',
    banyo: 'Banyo',
    'yatak-odasi': 'Yatak Odası',
    bahce: 'Bahçe',
    parfum: 'Parfüm',
    makyaj: 'Makyaj',
    'cilt-bakim': 'Cilt Bakım',
    'sac-bakim': 'Saç Bakımı',
    'kisisel-bakim': 'Kişisel Bakım',
    'spor-ayakkabi': 'Spor Ayakkabı',
    'spor-giyim': 'Spor Giyim',
    fitness: 'Fitness',
    kamp: 'Kamp & Doğa',
    bisiklet: 'Bisiklet',
    yuzme: 'Yüzme',
    roman: 'Roman',
    'kisisel-gelisim': 'Kişisel Gelişim',
    cocuk: 'Çocuk Kitapları',
    kirtasiye: 'Kırtasiye',
    defter: 'Defter'
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

  useEffect(() => {
    fetchProductsByCategory();
  }, [categoryId, subCategoryId]);

  useEffect(() => {
    sortProducts();
  }, [products, sortBy]);

  const fetchProductsByCategory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      let filtered = res.data;

      // Ana kategoriye göre filtrele
      if (categoryId) {
        let categoryTurkish = '';
        switch(categoryId) {
          case 'kadin': categoryTurkish = 'Kadın'; break;
          case 'erkek': categoryTurkish = 'Erkek'; break;
          case 'cocuk': categoryTurkish = 'Çocuk'; break;
          case 'elektronik': categoryTurkish = 'Elektronik'; break;
          case 'ev-yasam': categoryTurkish = 'Ev & Yaşam'; break;
          case 'kozmetik': categoryTurkish = 'Kozmetik'; break;
          case 'spor': categoryTurkish = 'Spor'; break;
          case 'kitap': categoryTurkish = 'Kitap'; break;
          default: categoryTurkish = '';
        }
        
        filtered = filtered.filter(product => 
          product.category?.toLowerCase() === categoryTurkish.toLowerCase()
        );
        
        setCategoryName(categoryNames[categoryId] || categoryId);
      }

      // Alt kategoriye göre filtrele (ürün adında veya açıklamada ara)
      if (subCategoryId) {
        const subName = subCategoryNames[subCategoryId] || subCategoryId;
        filtered = filtered.filter(product =>
          product.name?.toLowerCase().includes(subName.toLowerCase()) ||
          product.description?.toLowerCase().includes(subName.toLowerCase())
        );
        setCategoryName(`${categoryNames[categoryId]} / ${subName}`);
      }

      setProducts(filtered);
    } catch (err) {
      console.error("Ürünler yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  const sortProducts = () => {
    let sorted = [...products];
    
    switch(sortBy) {
      case 'bestseller':
        sorted.sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0));
        break;
      case 'price_asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'discount':
        sorted.sort((a, b) => b.discount - a.discount);
        break;
      default:
        sorted.sort((a, b) => b.id - a.id);
        break;
    }
    
    setFilteredProducts(sorted);
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
      toast.error('Favorilere eklemek için giriş yapmalısınız!');
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
      <div className="category-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-page">
      {/* Header */}
      <div className="category-header">
        <h1 className="category-title">{categoryName}</h1>
        <p className="category-count">{filteredProducts.length} ürün bulundu</p>
      </div>

      {/* Sıralama Dropdown */}
      <div className="category-sort-bar">
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
      </div>

      {/* Ürünler Grid */}
      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <p>Bu kategoride henüz ürün bulunmuyor.</p>
          <Link to="/" className="back-home-btn">Ana Sayfaya Dön</Link>
        </div>
      ) : (
        <div className="category-products-grid">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock_quantity <= 0;
            const hasDiscount = product.discount > 0;
            const discountedPrice = getDiscountedPrice(product.price, product.discount);
            const avgRating = getRatingValue(product.avg_rating || product.rating);
            const isFavorite = product.isFavorite || false;

            return (
              <Link key={product.id} to={`/product/${product.id}`} className="category-product-card">
                {/* Rozetler - SOL ÜST */}
                <div className="cat-badges-top-left">
                  {hasDiscount && !isOutOfStock && (
                    <div className="cat-discount-badge">-%{product.discount}</div>
                  )}
                  
                  {/* SADECE is_new === true/1 ise göster */}
                  {(product.is_new === 1 || product.is_new === true) && !isOutOfStock && !hasDiscount && (
                    <div className="cat-new-badge">Yeni</div>
                  )}
                  
                  {/* SADECE free_shipping === true/1 ise göster */}
                  {(product.free_shipping === 1 || product.free_shipping === true) && !isOutOfStock && (
                    <div className="cat-cargo-badge-top">
                      <Truck size={12} /> Kargo Bedava
                    </div>
                  )}
                </div>

                {/* Favori Butonu - SAĞ ÜST */}
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

                  <div className="cat-product-stats">
                    <div className="cat-product-rating">
                      <Star size={14} fill="#f59e0b" color="#f59e0b" />
                      <span className="cat-rating-value">{avgRating.toFixed(1)}</span>
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
        .category-sort-bar {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 30px;
        }

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
          border-color: #667eea;
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
          right: 0;
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

        /* SOL ÜST ROZETLER KONTEYNERİ */
        .cat-badges-top-left {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 10;
        }

        /* İNDİRİM ROZETİ */
        .cat-discount-badge {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          font-size: 12px;
          font-weight: 800;
          padding: 5px 12px;
          border-radius: 30px;
          width: fit-content;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        /* YENİ ÜRÜN ROZETİ */
        .cat-new-badge {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          font-size: 12px;
          font-weight: 800;
          padding: 5px 12px;
          border-radius: 30px;
          width: fit-content;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        /* KARGO BEDAVA ROZETİ */
        .cat-cargo-badge-top {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          font-size: 11px;
          font-weight: 800;
          padding: 5px 12px;
          border-radius: 30px;
          display: flex;
          align-items: center;
          gap: 6px;
          width: fit-content;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  );
};

export default CategoryPage;