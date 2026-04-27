import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, User, Search, Store, LayoutDashboard, Heart, X, 
  ChevronDown, ChevronRight, Grid3X3, 
  Shirt, Home, Smartphone, Baby, Watch, 
  Sparkles, Gamepad, Book, Coffee, Car, 
  GraduationCap, Dumbbell, Laptop, Sofa, Package
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
  const categoryTimeoutRef = useRef(null);

  // Kategoriler ve alt kategoriler
  const categories = [
    {
      id: 'kadin',
      name: 'Kadın',
      icon: <Shirt size={18} />,
      subCategories: [
        { name: 'Giyim', path: '/category/kadin/giyim' },
        { name: 'Elbise', path: '/category/kadin/elbise' },
        { name: 'Tişört', path: '/category/kadin/tisort' },
        { name: 'Gömlek', path: '/category/kadin/gomlek' },
        { name: 'Kot Pantolon', path: '/category/kadin/kot-pantolon' },
        { name: 'Kot Ceket', path: '/category/kadin/kot-ceket' },
        { name: 'Ayakkabı', path: '/category/kadin/ayakkabi' },
        { name: 'Çanta', path: '/category/kadin/canta' },
        { name: 'Aksesuar', path: '/category/kadin/aksesuar' }
      ]
    },
    {
      id: 'erkek',
      name: 'Erkek',
      icon: <User size={18} />,
      subCategories: [
        { name: 'Giyim', path: '/category/erkek/giyim' },
        { name: 'Tişört', path: '/category/erkek/tisort' },
        { name: 'Gömlek', path: '/category/erkek/gomlek' },
        { name: 'Pantolon', path: '/category/erkek/pantolon' },
        { name: 'Ceket', path: '/category/erkek/ceket' },
        { name: 'Ayakkabı', path: '/category/erkek/ayakkabi' },
        { name: 'Saat', path: '/category/erkek/saat' },
        { name: 'Cüzdan', path: '/category/erkek/cuzdan' },
        { name: 'Aksesuar', path: '/category/erkek/aksesuar' }
      ]
    },
    {
      id: 'cocuk',
      name: 'Çocuk',
      icon: <Baby size={18} />,
      subCategories: [
        { name: 'Kız Çocuk', path: '/category/cocuk/kiz' },
        { name: 'Erkek Çocuk', path: '/category/cocuk/erkek' },
        { name: 'Bebek', path: '/category/cocuk/bebek' },
        { name: 'Oyuncak', path: '/category/cocuk/oyuncak' },
        { name: 'Okul Kıyafetleri', path: '/category/cocuk/okul' }
      ]
    },
    {
      id: 'elektronik',
      name: 'Elektronik',
      icon: <Smartphone size={18} />,
      subCategories: [
        { name: 'Telefon', path: '/category/elektronik/telefon' },
        { name: 'Bilgisayar', path: '/category/elektronik/bilgisayar' },
        { name: 'Tablet', path: '/category/elektronik/tablet' },
        { name: 'Kulaklık', path: '/category/elektronik/kulaklik' },
        { name: 'Akıllı Saat', path: '/category/elektronik/akilli-saat' },
        { name: 'Oyun Konsolu', path: '/category/elektronik/oyun-konsolu' },
        { name: 'Aksesuar', path: '/category/elektronik/aksesuar' }
      ]
    },
    {
      id: 'ev-yasam',
      name: 'Ev & Yaşam',
      icon: <Home size={18} />,
      subCategories: [
        { name: 'Mobilya', path: '/category/ev/mobilya' },
        { name: 'Dekorasyon', path: '/category/ev/dekorasyon' },
        { name: 'Mutfak', path: '/category/ev/mutfak' },
        { name: 'Banyo', path: '/category/ev/banyo' },
        { name: 'Yatak Odası', path: '/category/ev/yatak-odasi' },
        { name: 'Bahçe', path: '/category/ev/bahce' }
      ]
    },
    {
      id: 'kozmetik',
      name: 'Kozmetik',
      icon: <Sparkles size={18} />,
      subCategories: [
        { name: 'Parfüm', path: '/category/kozmetik/parfum' },
        { name: 'Makyaj', path: '/category/kozmetik/makyaj' },
        { name: 'Cilt Bakım', path: '/category/kozmetik/cilt-bakim' },
        { name: 'Saç Bakım', path: '/category/kozmetik/sac-bakim' },
        { name: 'Kişisel Bakım', path: '/category/kozmetik/kisisel-bakim' }
      ]
    },
    {
      id: 'spor',
      name: 'Spor & Outdoor',
      icon: <Dumbbell size={18} />,
      subCategories: [
        { name: 'Spor Ayakkabı', path: '/category/spor/ayakkabi' },
        { name: 'Spor Giyim', path: '/category/spor/giyim' },
        { name: 'Fitness', path: '/category/spor/fitness' },
        { name: 'Kamp & Doğa', path: '/category/spor/kamp' },
        { name: 'Bisiklet', path: '/category/spor/bisiklet' },
        { name: 'Yüzme', path: '/category/spor/yuzme' }
      ]
    },
    {
      id: 'kitap',
      name: 'Kitap & Kırtasiye',
      icon: <Book size={18} />,
      subCategories: [
        { name: 'Roman', path: '/category/kitap/roman' },
        { name: 'Kişisel Gelişim', path: '/category/kitap/kisisel-gelisim' },
        { name: 'Çocuk Kitapları', path: '/category/kitap/cocuk' },
        { name: 'Kırtasiye', path: '/category/kirtasiye' },
        { name: 'Defter', path: '/category/kirtasiye/defter' }
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

  // Favori butonuna tıklayınca profile favoriler sekmesine git
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
        
        {/* LOGO */}
        <Link to="/" className="mcg-navbar-logo">
          <div className="mcg-navbar-logo-icon">
            <Store size={24} />
          </div>
          <span className="mcg-navbar-logo-text">
            MCG<span className="mcg-navbar-logo-highlight">SHOP</span>
          </span>
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
              placeholder="Ürün, kategori veya marka ara..." 
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

          {/* Favoriler Butonu - Profile Favoriler Sekmesine Yönlendirir */}
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