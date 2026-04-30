// src/pages/CategoryPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { toast } from 'react-toastify';
import { formatPrice, formatDiscountedPrice, getImageUrl } from '../utils/formatPrice';
import { ShoppingCart, Heart, Truck, ChevronDown } from 'lucide-react';
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

  // Kategori isimleri (URL'den gelen -> Görünen isim)
  const categoryNames = {
    parfum: 'Parfüm',
    makyaj: 'Makyaj',
    'cilt-bakim': 'Cilt Bakım',
    'sac-bakim': 'Saç Bakım',
    'vucut-bakim': 'Vücut Bakım',
    'erkek-bakim': 'Erkek Bakım',
    aksesuar: 'Aksesuar'
  };

  // Alt kategori isimleri - ÜRÜN ADI veya KATEGORİ içinde aranacak
  const subCategorySearchTerms = {
    kadin: ['Kadın', 'Kadın Parfüm', 'Kadın Parfümü'],
    erkek: ['Erkek', 'Erkek Parfüm', 'Erkek Parfümü'],
    uniseks: ['Uniseks', 'Unisex'],
    setleri: ['Set', 'Hediye Seti', 'Setleri'],
    mini: ['Mini', 'Seyahat', 'Mini Boy'],
    arap: ['Arap', 'Doğu', 'Oud', 'Arap Parfümü'],
    nis: ['Niş', 'Niche', 'Niş Parfüm'],
    ruj: ['Ruj', 'Likit Ruj', 'Mat Ruj', 'Rujlar'],
    fondoten: ['Fondöten', 'Fondoten', 'BB Cream'],
    allik: ['Allık', 'Blush'],
    far: ['Far', 'Göz Farı', 'Eyeshadow'],
    maskara: ['Maskara', 'Mascara'],
    pudra: ['Pudra', 'Transparan Pudra', 'Fix Pudra'],
    aydinlatici: ['Aydınlatıcı', 'Highlighter', 'Kontür'],
    setleri: ['Set', 'Makyaj Seti'],
    fircalar: ['Fırça', 'Makyaj Fırçası'],
    temizleyici: ['Temizleyici', 'Yüz temizleme', 'Cleanser'],
    nemlendirici: ['Nemlendirici', 'Moisturizer', 'Krem'],
    'gunes-kremi': ['Güneş Kremi', 'SPF', 'Sunscreen'],
    serum: ['Serum', 'Cilt Serumu'],
    maske: ['Maske', 'Yüz Maskesi', 'Sheet Mask'],
    tonik: ['Tonik', 'Toner'],
    peeling: ['Peeling', 'Eksfoliyant'],
    goz: ['Göz Bakım', 'Göz Kremi'],
    sampuan: ['Şampuan', 'Şampuan', 'Shampoo'],
    krem: ['Saç Kremi', 'Kondisyoner', 'Conditioner'],
    yag: ['Saç Yağı', 'Argan Yağı', 'Hindistan Cevizi Yağı'],
    sprey: ['Saç Spreyi', 'Hair Spray'],
    boya: ['Saç Boyası', 'Hair Color'],
    kepek: ['Kepek Şampuan', 'Anti Kepek'],
    dokulme: ['Dökülme Karşıtı', 'Saç Dökülmesi'],
    'duş-jeli': ['Duş Jeli', 'Vücut Yıkama'],
    losyon: ['Vücut Losyonu', 'Body Lotion'],
    'el-ayak': ['El Kremi', 'Ayak Bakım'],
    deodorant: ['Deodorant', 'Roll On', 'Spray'],
    tras: ['Tıraş', 'Tıraş Köpüğü', 'Tıraş Jeli'],
    sakal: ['Sakal', 'Sakal Yağı', 'Sakal Kremi'],
    'makyaj-cantasi': ['Makyaj Çantası', 'Kozmetik Çantası'],
    ayna: ['Ayna', 'Makyaj Aynası'],
    pamuk: ['Pamuk', 'Sünger', 'Makyaj Süngeri'],
    fircalik: ['Fırçalık', 'Fırça Seti'],
    seyahat: ['Seyahat Seti', 'Seyahat Boy']
  };

  const getCategoryName = () => {
    if (subCategoryId) {
      const mainCat = categoryNames[categoryId] || categoryId;
      const subName = getSubCategoryDisplayName();
      return `${mainCat} / ${subName}`;
    }
    return categoryNames[categoryId] || categoryId;
  };

  const getSubCategoryDisplayName = () => {
    const subNames = {
      kadin: 'Kadın', erkek: 'Erkek', uniseks: 'Uniseks',
      setleri: 'Setler', mini: 'Mini Boy', arap: 'Arap Parfümleri',
      nis: 'Niş Parfümler', ruj: 'Ruj', fondoten: 'Fondöten',
      allik: 'Allık', far: 'Far', maskara: 'Maskara',
      pudra: 'Pudra', aydinlatici: 'Aydınlatıcı & Kontür',
      fircalar: 'Fırçalar', temizleyici: 'Temizleyiciler',
      nemlendirici: 'Nemlendiriciler', 'gunes-kremi': 'Güneş Kremleri',
      serum: 'Serumlar', maske: 'Maskeler', tonik: 'Tonikler',
      peeling: 'Peeling', goz: 'Göz Bakımı', sampuan: 'Şampuan',
      krem: 'Saç Kremi', yag: 'Saç Yağları', sprey: 'Saç Spreyleri',
      boya: 'Saç Boyası', kepek: 'Kepek Şampuan', dokulme: 'Dökülme Karşıtı',
      'duş-jeli': 'Duş Jeli', losyon: 'Vücut Losyonu', 'el-ayak': 'El & Ayak Bakım',
      deodorant: 'Deodorant', tras: 'Tıraş Ürünleri', sakal: 'Sakal Bakımı',
      'makyaj-cantasi': 'Makyaj Çantası', ayna: 'Aynalar',
      pamuk: 'Pamuk & Sünger', fircalik: 'Fırçalık', seyahat: 'Seyahat Setleri'
    };
    return subNames[subCategoryId] || subCategoryId;
  };

  const sortOptions = [
    { value: 'default', label: 'Önerilen', icon: '✨' },
    { value: 'bestseller', label: 'En Çok Satanlar', icon: '🏆' },
    { value: 'price_asc', label: 'Fiyata Göre Artan', icon: '📈' },
    { value: 'price_desc', label: 'Fiyata Göre Azalan', icon: '📉' },
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

      // Ana kategoriye göre filtrele (category alanından)
      if (categoryId) {
        let categoryTurkish = '';
        switch(categoryId) {
          case 'parfum': categoryTurkish = 'Parfüm'; break;
          case 'makyaj': categoryTurkish = 'Makyaj'; break;
          case 'cilt-bakim': categoryTurkish = 'Cilt Bakım'; break;
          case 'sac-bakim': categoryTurkish = 'Saç Bakım'; break;
          case 'vucut-bakim': categoryTurkish = 'Vücut Bakım'; break;
          case 'erkek-bakim': categoryTurkish = 'Erkek Bakım'; break;
          case 'aksesuar': categoryTurkish = 'Aksesuar'; break;
          default: categoryTurkish = '';
        }
        
        filtered = filtered.filter(product => 
          product.category?.toLowerCase() === categoryTurkish.toLowerCase()
        );
      }

      // Alt kategoriye göre filtrele (ürün adında veya açıklamada ara)
      if (subCategoryId) {
        const searchTerms = subCategorySearchTerms[subCategoryId] || [subCategoryId];
        filtered = filtered.filter(product => {
          const productName = (product.name || '').toLowerCase();
          const productDesc = (product.description || '').toLowerCase();
          const productCategory = (product.category || '').toLowerCase();
          
          return searchTerms.some(term => 
            productName.includes(term.toLowerCase()) ||
            productDesc.includes(term.toLowerCase()) ||
            productCategory.includes(term.toLowerCase())
          );
        });
      }

      setProducts(filtered);
      setCategoryName(getCategoryName());
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
      <div className="category-header">
        <h1 className="category-title">{categoryName}</h1>
        <p className="category-count">{filteredProducts.length} ürün bulundu</p>
      </div>

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
            const isFavorite = product.isFavorite || false;

            return (
              <Link key={product.id} to={`/product/${product.id}`} className="category-product-card">
                <div className="cat-badges-top-left">
                  {hasDiscount && !isOutOfStock && (
                    <div className="cat-discount-badge">-%{product.discount}</div>
                  )}
                  {(product.is_new === 1 || product.is_new === true) && !isOutOfStock && !hasDiscount && (
                    <div className="cat-new-badge">Yeni</div>
                  )}
                  {(product.free_shipping === 1 || product.free_shipping === true) && !isOutOfStock && (
                    <div className="cat-cargo-badge-top">
                      <Truck size={12} /> Kargo Bedava
                    </div>
                  )}
                </div>

                <button 
                  className={`cat-favorite-btn ${isFavorite ? 'favorite-active' : ''}`}
                  onClick={(e) => toggleFavorite(product.id, e)}
                >
                  <Heart size={18} fill={isFavorite ? "white" : "none"} />
                </button>

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
          border-color: #e11d48;
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
          background: #fef2f2;
          color: #e11d48;
        }

        .sort-option-icon {
          font-size: 16px;
        }

        .sort-option-check {
          margin-left: auto;
          color: #e11d48;
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
          z-index: 5;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .favorite-active {
          background: #e11d48;
          color: white;
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
          color: #1e293b;
        }

        .cat-product-name {
          font-size: 15px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 42px;
        }

        .cat-add-to-cart-btn {
          width: 100%;
          background: #1e293b;
          color: white;
          padding: 12px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          border: none;
          margin-top: 8px;
          transition: background 0.3s;
        }

        .cat-add-to-cart-btn:hover:not(:disabled) {
          background: #e11d48;
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

        .back-home-btn {
          background: linear-gradient(135deg, #e11d48, #be123c);
          color: white;
          padding: 12px 32px;
          border-radius: 40px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          display: inline-block;
          text-decoration: none;
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
          border-top-color: #e11d48;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .category-products-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 15px;
          }
          .cat-product-image-wrapper {
            height: 240px;
          }
          .category-title {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default CategoryPage;