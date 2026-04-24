// src/pages/SearchPage.jsx
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/api';
import { ShoppingCart, Heart, AlertCircle, Star, Truck, Search, ChevronDown } from 'lucide-react';
import { formatPrice, formatDiscountedPrice, getImageUrl } from '../utils/formatPrice';
import { toast } from 'react-toastify';
import '../styles/SearchPage.css';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortBy, setSortBy] = useState('default');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

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
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0 && query) {
      filterProducts();
    }
  }, [products, query]);

  useEffect(() => {
    if (filteredProducts.length > 0) {
      sortProducts();
    }
  }, [sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error("Ürünler yüklenemedi", err);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    const searchTerm = query.toLowerCase();
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      (product.category && product.category.toLowerCase().includes(searchTerm)) ||
      (product.description && product.description.toLowerCase().includes(searchTerm))
    );
    setFilteredProducts(filtered);
  };

  const sortProducts = () => {
    let sorted = [...filteredProducts];
    
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
    setFilteredProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === productId
          ? {
              ...product,
              isFavorite: response.data.isFavorite,
              favorite_count: response.data.isFavorite
                ? (product.favorite_count || 0) + 1
                : (product.favorite_count || 0) - 1
            }
          : product
      )
    );
    if (response.data.isFavorite) {
      toast.success('Favorilere eklendi!');
    } else {
      toast.error('Favorilerden çıkarıldı');
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
      <div className="search-page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-page-container">
      {/* Header */}
      <div className="search-header">
        <div className="search-header-content">
          <Search size={32} />
          <h1>Arama Sonuçları</h1>
          <p>"{query}" için {filteredProducts.length} sonuç bulundu</p>
        </div>
      </div>

      {/* Sıralama Dropdown */}
      <div className="search-sort-bar">
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

      {/* Sonuçlar */}
      {filteredProducts.length === 0 ? (
        <div className="no-results">
          <Search size={80} />
          <h2>Sonuç bulunamadı</h2>
          <p>"{query}" ile ilgili ürün bulunamadı. Farklı kelimeler deneyin.</p>
          <Link to="/" className="back-home-btn">Ana Sayfaya Dön</Link>
        </div>
      ) : (
        <div className="search-results-grid">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock_quantity <= 0;
            const hasDiscount = product.discount > 0;
            const discountedPrice = getDiscountedPrice(product.price, product.discount);
            const avgRating = getRatingValue(product.avg_rating || product.rating);
            const totalReviews = product.total_reviews || product.rating_count || 0;
            const favoriteCount = product.favorite_count || 0;
            const isFavorite = product.isFavorite || false;

            return (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="search-result-card"
              >
                {/* Resim Alanı */}
                <div className="search-result-image-wrapper">
                  {hasDiscount && !isOutOfStock && (
  <div className="discount-badge">-%{product.discount}</div>
)}
{(product.is_new === 1 || product.is_new === true) && !isOutOfStock && !hasDiscount && (
  <div className="new-badge">Yeni</div>
)}
{(product.free_shipping === 1 || product.free_shipping === true) && !isOutOfStock && (
  <div className="cargo-badge">
    <Truck size={12} /> Kargo Bedava
  </div>
)}
                  
                  <button
                    className={`favorite-btn ${isFavorite ? 'favorite-active' : ''}`}
                    onClick={(e) => toggleFavorite(product.id, e)}
                  >
                    <Heart size={18} fill={isFavorite ? "white" : "none"} />
                  </button>

                  <img
  src={getImageUrl(product.image_url)}
  alt={product.name}
  className="search-result-image"
/>

                  {isOutOfStock && (
                    <div className="outstock-overlay">
                      <span className="outstock-text">Tükendi</span>
                    </div>
                  )}
                </div>

                {/* Bilgiler */}
                <div className="search-result-info">
                  <div className="product-prices">
                    {hasDiscount && !isOutOfStock ? (
                      <>
                        <span className="cat-price-original">{formatPrice(product.price)} TL</span>
      <span className="cat-price-discount">{formatDiscountedPrice(product.price, product.discount)} TL</span>
    </>
  ) : (
    <span className="cat-price-current">{formatPrice(product.price)} TL</span>
                    )}
                  </div>

                  <h3 className="product-name">{product.name}</h3>
                  
                  <p className="product-description">
                    {product.description?.substring(0, 80) || "Premium kalite ürün"}
                    {product.description?.length > 80 && "..."}
                  </p>

                  

                  <button
                    className="add-to-cart-btn"
                    disabled={isOutOfStock}
                    onClick={(e) => addToCart(product, e)}
                  >
                    {isOutOfStock ? (
                      <><AlertCircle size={16} /> Tükendi</>
                    ) : (
                      <><ShoppingCart size={16} /> Sepete Ekle</>
                    )}
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        .search-sort-bar {
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
      `}</style>
    </div>
  );
};

export default SearchPage;