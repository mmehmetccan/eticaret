import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, User, Search, LayoutDashboard, Heart, X, 
  ChevronDown, ChevronRight, Grid3X3, 
  SprayCan, Flower2, Droplets, Eye, Bath, 
  Scissors, Gem, Sparkles, Package, Shield, Sun,
  Palette, Wind, Droplet, Share2, CircleUserRound
} from 'lucide-react';
import api from '../api/api';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const searchRef = useRef(null);
  const categoryRef = useRef(null);

  // Kategoriler ve alt kategoriler - PARFÜM & KOZMETİK
  const categories = [
    {
      id: 'parfum',
      name: 'Parfüm',
      icon: <SprayCan size={18} />,
      subCategories: [
        { name: 'Kadın Parfüm', path: '/category/parfum/kadın' },
        { name: 'Erkek Parfüm', path: '/category/parfum/erkek' },
        { name: 'Uniseks Parfüm', path: '/category/parfum/uniseks' },
        { name: 'Parfüm Setleri', path: '/category/parfum/setleri' },
        { name: 'Mini Parfümler', path: '/category/parfum/mini' },
        { name: 'Arap Parfümleri', path: '/category/parfum/arap' },
        { name: 'Niş Parfümler', path: '/category/parfum/nis' }
      ]
    },
    {
      id: 'makyaj',
      name: 'Makyaj',
      icon: <Palette size={18} />,
      subCategories: [
        { name: 'Ruj & Likit Ruj', path: '/category/makyaj/ruj' },
        { name: 'Fondöten', path: '/category/makyaj/fondoten' },
        { name: 'Allık', path: '/category/makyaj/allik' },
        { name: 'Far & Göz Kalemi', path: '/category/makyaj/far' },
        { name: 'Maskara', path: '/category/makyaj/maskara' },
        { name: 'Pudra & Baz', path: '/category/makyaj/pudra' },
        { name: 'Aydınlatıcı & Kontür', path: '/category/makyaj/aydinlatici' },
        { name: 'Makyaj Setleri', path: '/category/makyaj/setleri' },
        { name: 'Makyaj Fırçaları', path: '/category/makyaj/fircalar' }
      ]
    },
    {
      id: 'cilt-bakim',
      name: 'Cilt Bakım',
      icon: <Droplets size={18} />,
      subCategories: [
        { name: 'Temizleyiciler', path: '/category/cilt-bakim/temizleyici' },
        { name: 'Nemlendiriciler', path: '/category/cilt-bakim/nemlendirici' },
        { name: 'Güneş Kremleri', path: '/category/cilt-bakim/gunes-kremi' },
        { name: 'Serumlar', path: '/category/cilt-bakim/serum' },
        { name: 'Maskeler', path: '/category/cilt-bakim/maske' },
        { name: 'Tonikler', path: '/category/cilt-bakim/tonik' },
        { name: 'Peeling & Eksfoliyant', path: '/category/cilt-bakim/peeling' },
        { name: 'Göz Bakım', path: '/category/cilt-bakim/goz' }
      ]
    },
    {
      id: 'sac-bakim',
      name: 'Saç Bakım',
      icon: <Scissors size={18} />,
      subCategories: [
        { name: 'Şampuan', path: '/category/sac-bakim/sampuan' },
        { name: 'Saç Kremi', path: '/category/sac-bakim/krem' },
        { name: 'Saç Maskesi', path: '/category/sac-bakim/maske' },
        { name: 'Saç Yağları', path: '/category/sac-bakim/yag' },
        { name: 'Saç Spreyleri', path: '/category/sac-bakim/sprey' },
        { name: 'Saç Boyası', path: '/category/sac-bakim/boya' },
        { name: 'Kepek Şampuan', path: '/category/sac-bakim/kepek' },
        { name: 'Dökülme Karşıtı', path: '/category/sac-bakim/dokulme' }
      ]
    },
    {
      id: 'vucut-bakim',
      name: 'Vücut Bakım',
      icon: <Bath size={18} />,
      subCategories: [
        { name: 'Duş Jeli', path: '/category/vucut-bakim/duş-jeli' },
        { name: 'Vücut Losyonu', path: '/category/vucut-bakim/losyon' },
        { name: 'Vücut Yağı', path: '/category/vucut-bakim/yag' },
        { name: 'El & Ayak Bakım', path: '/category/vucut-bakim/el-ayak' },
        { name: 'Deodorant', path: '/category/vucut-bakim/deodorant' },
        { name: 'Tıraş Ürünleri', path: '/category/vucut-bakim/tras' }
      ]
    },
    {
      id: 'erkek-bakim',
      name: 'Erkek Bakım',
      icon: <Shield size={18} />,
      subCategories: [
        { name: 'Tıraş Ürünleri', path: '/category/erkek-bakim/tras' },
        { name: 'Erkek Parfüm', path: '/category/erkek-bakim/parfum' },
        { name: 'Yüz Bakım', path: '/category/erkek-bakim/yuz' },
        { name: 'Saç Bakım', path: '/category/erkek-bakim/sac' },
        { name: 'Sakal Bakım', path: '/category/erkek-bakim/sakal' }
      ]
    },
    {
      id: 'aksesuar',
      name: 'Aksesuar',
      icon: <Gem size={18} />,
      subCategories: [
        { name: 'Makyaj Çantası', path: '/category/aksesuar/makyaj-cantasi' },
        { name: 'Aynalar', path: '/category/aksesuar/ayna' },
        { name: 'Pamuk & Sünger', path: '/category/aksesuar/pamuk' },
        { name: 'Fırçalık', path: '/category/aksesuar/fircalik' },
        { name: 'Seyahat Setleri', path: '/category/aksesuar/seyahat' }
      ]
    },
    {
      id: 'markalar',
      name: 'Markalar',
      icon: <Package size={18} />,
      subCategories: [
        { name: 'Dior', path: '/brand/dior' },
        { name: 'Chanel', path: '/brand/chanel' },
        { name: 'Lancôme', path: '/brand/lancome' },
        { name: 'MAC', path: '/brand/mac' },
        { name: 'NYX', path: '/brand/nyx' },
        { name: 'The Ordinary', path: '/brand/the-ordinary' },
        { name: 'Tüm Markalar', path: '/brands' }
      ]
    }
  ];

  // Türkçe karakter dönüştürme
  const normalizeTurkish = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');
  };

  // Dışarı tıklayınca kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
        setActiveCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ürünleri yükle
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await api.get('/products');
        setAllProducts(res.data);
      } catch (err) {
        console.error("Ürünler yüklenemedi:", err);
      }
    };
    fetchAllProducts();
  }, []);

  // Arama işlemi
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setSearchLoading(true);
    const searchNormalized = normalizeTurkish(searchTerm);
    
    const filtered = allProducts.filter(product => {
      const nameMatch = normalizeTurkish(product.name || '').includes(searchNormalized);
      const categoryMatch = normalizeTurkish(product.category || '').includes(searchNormalized);
      const descMatch = normalizeTurkish(product.description || '').includes(searchNormalized);
      return nameMatch || categoryMatch || descMatch;
    });
    
    setSearchResults(filtered.slice(0, 8));
    setShowResults(true);
    setSearchLoading(false);
  }, [searchTerm, allProducts]);

  const handleProductClick = (productId) => {
    setShowResults(false);
    setSearchTerm('');
    navigate(`/product/${productId}`);
  };

  const formatPrice = (price, discount) => {
    if (discount && discount > 0) {
      const discountedPrice = price - (price * discount / 100);
      return (
        <div className="mcg-search-price">
          <span className="mcg-search-price-original">{price} TL</span>
          <span className="mcg-search-price-discount">{Math.floor(discountedPrice)} TL</span>
        </div>
      );
    }
    return <span className="mcg-search-price-current">{price} TL</span>;
  };

  const handleFavoritesClick = (e) => {
    e.preventDefault();
    if (user) {
      navigate('/profile', { state: { activeTab: 'favorites' } });
    } else {
      navigate('/login');
    }
  };

  return (
    <nav className="mcg-navbar">
      <div className="mcg-navbar-container">
        
        {/* LOGO - RESİM OLARAK */}
       <Link to="/" className="mcg-navbar-logo">
  <img 
    src="/us_kozmetik_yuvarlak.jpg" 
    alt="US Kozmetik & Parfüm" 
    className="mcg-navbar-logo-img"
  />
  <div className="mcg-navbar-logo-text">
    <span className="mcg-navbar-logo-brand">US</span>
    <span className="mcg-navbar-logo-sub">KOZMETİK & PARFÜM</span>
  </div>
</Link>

        {/* KATEGORİ MENÜSÜ */}
        <div className="mcg-category-menu" ref={categoryRef}>
          <button 
            className="mcg-category-btn"
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          >
            <Grid3X3 size={18} />
            <span>Kategoriler</span>
            <ChevronDown size={16} className={`mcg-category-arrow ${isCategoryOpen ? 'rotate' : ''}`} />
          </button>

          {isCategoryOpen && (
            <div className="mcg-category-dropdown">
              <div className="mcg-category-grid">
                {categories.map((category) => (
                  <div 
                    key={category.id}
                    className="mcg-category-item"
                    onMouseEnter={() => setActiveCategory(category.id)}
                    onMouseLeave={() => setActiveCategory(null)}
                  >
                    <div className={`mcg-category-header ${activeCategory === category.id ? 'active' : ''}`}>
                      <span className="mcg-category-icon">{category.icon}</span>
                      <span className="mcg-category-name">{category.name}</span>
                      <ChevronRight size={14} className="mcg-category-chevron" />
                    </div>
                    
                    {activeCategory === category.id && (
                      <div className="mcg-subcategory-dropdown">
                        <div className="mcg-subcategory-header">
                          {category.icon}
                          <span>{category.name}</span>
                        </div>
                        <div className="mcg-subcategory-grid">
                          {category.subCategories.map((sub, idx) => (
                            <Link 
                              key={idx} 
                              to={sub.path}
                              className="mcg-subcategory-link"
                              onClick={() => {
                                setIsCategoryOpen(false);
                                setActiveCategory(null);
                              }}
                            >
                              {sub.name}
                            </Link>
                          ))}
                          <Link 
                            to={`/category/${category.id}`}
                            className="mcg-subcategory-viewall"
                            onClick={() => {
                                setIsCategoryOpen(false);
                                setActiveCategory(null);
                            }}
                          >
                            Tümünü Gör →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ARAMA KUTUSU */}
        <div className="mcg-navbar-search" ref={searchRef}>
          <div className="mcg-navbar-search-wrapper">
            <Search className="mcg-navbar-search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Parfüm, krem, şampuan veya marka ara..." 
              className="mcg-navbar-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
            />
            {searchTerm && (
              <button 
                className="mcg-navbar-search-clear"
                onClick={() => {
                  setSearchTerm('');
                  setShowResults(false);
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* ARAMA SONUÇLARI */}
          {showResults && (
            <div className="mcg-search-results">
              {searchLoading ? (
                <div className="mcg-search-loading">
                  <div className="mcg-search-spinner"></div>
                  <span>Aranıyor...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="mcg-search-no-results">
                  <Search size={40} />
                  <p>"{searchTerm}" için sonuç bulunamadı</p>
                  <span>Farklı kelimeler deneyin</span>
                </div>
              ) : (
                <>
                  <div className="mcg-search-results-header">
                    <span>{searchResults.length} ürün bulundu</span>
                    <button onClick={() => {
                      setShowResults(false);
                      navigate(`/search?q=${searchTerm}`);
                    }}>
                      Tümünü Gör
                    </button>
                  </div>
                  {searchResults.map((product) => (
                    <div 
                      key={product.id} 
                      className="mcg-search-result-item"
                      onClick={() => handleProductClick(product.id)}
                    >
                      <div className="mcg-search-result-image">
                        <img 
                          src={product.image_url ? `http://82.29.168.62:5001${product.image_url}` : 'https://placehold.co/44x44/e2e8f0/64748b?text=No+Image'} 
                          alt={product.name}
                        />
                      </div>
                      <div className="mcg-search-result-info">
                        <h4>{product.name}</h4>
                        {formatPrice(product.price, product.discount)}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* SAĞ MENÜ */}
        <div className="mcg-navbar-actions">
          
          {/* Admin Butonu */}
          {user?.role === 'admin' && (
            <button onClick={() => navigate('/admin')} className="mcg-navbar-admin-btn">
              <LayoutDashboard size={16} />
              <span>Panel</span>
            </button>
          )}

          {/* Profil / Giriş */}
          {user ? (
            <Link to="/profile" className="mcg-navbar-avatar">
              <div className="mcg-navbar-avatar-image">
                {user.full_name?.charAt(0).toUpperCase()}
              </div>
              <div className="mcg-navbar-avatar-info">
                <div className="mcg-navbar-avatar-label">Hesabım</div>
                <div className="mcg-navbar-avatar-name">{user.full_name?.split(' ')[0]}</div>
              </div>
            </Link>
          ) : (
            <Link to="/login" className="mcg-navbar-btn">
              <User size={20} />
            </Link>
          )}

          {/* Favoriler Butonu */}
          <button 
            onClick={handleFavoritesClick}
            className="mcg-navbar-btn"
            title="Favorilerim"
          >
            <Heart size={20} />
          </button>

          {/* Sepet */}
          <Link to="/cart" className="mcg-navbar-btn">
            <ShoppingCart size={20} />
            <span className="mcg-navbar-cart-badge">0</span>
          </Link>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;