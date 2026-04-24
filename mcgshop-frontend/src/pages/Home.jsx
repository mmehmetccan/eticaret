import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { ShoppingCart, Heart, AlertCircle, ChevronLeft, ChevronRight, Star, Truck, Clock, Zap, TrendingUp, Award, Gift } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatPrice, formatDiscountedPrice, getImageUrl } from '../utils/formatPrice';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [favoriteAnim, setFavoriteAnim] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [freeShippingProducts, setFreeShippingProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  
  const discountSliderRef = useRef(null);
  const newProductsSliderRef = useRef(null);
  const freeShippingSliderRef = useRef(null);
  const recommendedSliderRef = useRef(null);
  
  const autoScrollInterval = useRef(null);
  const heroAutoScrollInterval = useRef(null);

  // Kullanıcı kontrolü
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    setIsLoggedIn(!!user);
  }, []);

  useEffect(() => {
    fetchProducts();
    startAutoScroll();
    startHeroAutoScroll();
    return () => {
      stopAutoScroll();
      stopHeroAutoScroll();
    };
  }, []);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getRandomProducts = (productsList, count = 10) => {
    if (!productsList || productsList.length === 0) return [];
    const shuffled = shuffleArray(productsList);
    return shuffled.slice(0, count);
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
      toast.success(`🎉 ${product.name} sepete eklendi!`, {
        duration: 2000,
      });
    } catch (err) {
      toast.error(err.response?.data?.error || '❌ Bir hata oluştu.');
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      const allProducts = res.data;
      setProducts(allProducts);
      
      const initialIndex = {};
      allProducts.forEach(product => {
        initialIndex[product.id] = 0;
      });
      setCurrentImageIndex(initialIndex);
      
      const discounted = allProducts.filter(p => p.discount > 0);
      const newItems = allProducts.filter(p => p.is_new === 1 || p.is_new === true);
      const freeShipping = allProducts.filter(p => p.free_shipping === 1 || p.free_shipping === true);
      const recommended = allProducts.filter(p => p.discount === 0 && p.is_new !== 1 && p.is_new !== true && p.free_shipping !== 1 && p.free_shipping !== true);
      
      setDiscountedProducts(getRandomProducts(discounted, 10));
      setNewProducts(getRandomProducts(newItems, 10));
      setFreeShippingProducts(getRandomProducts(freeShipping, 10));
      setRecommendedProducts(getRandomProducts(recommended, 10));
      
    } catch (err) {
      console.error("Ürünler yüklenemedi", err);
    } finally {
      setLoading(false);
    }
  };

  // Her 30 saniyede bir ürünleri yenile
  useEffect(() => {
    if (!loading && products.length > 0) {
      const refreshInterval = setInterval(() => {
        const discounted = products.filter(p => p.discount > 0);
        const newItems = products.filter(p => p.is_new === 1 || p.is_new === true);
        const freeShipping = products.filter(p => p.free_shipping === 1 || p.free_shipping === true);
        const recommended = products.filter(p => p.discount === 0 && p.is_new !== 1 && p.is_new !== true && p.free_shipping !== 1 && p.free_shipping !== true);
        
        setDiscountedProducts(getRandomProducts(discounted, 10));
        setNewProducts(getRandomProducts(newItems, 10));
        setFreeShippingProducts(getRandomProducts(freeShipping, 10));
        setRecommendedProducts(getRandomProducts(recommended, 10));
      }, 30000);
      
      return () => clearInterval(refreshInterval);
    }
  }, [loading, products]);

  const startAutoScroll = () => {
    autoScrollInterval.current = setInterval(() => {
      if (discountSliderRef.current) {
        const scrollAmount = 380;
        if (discountSliderRef.current.scrollLeft + scrollAmount >= discountSliderRef.current.scrollWidth - discountSliderRef.current.clientWidth) {
          discountSliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          discountSliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 5000);
  };

  const stopAutoScroll = () => {
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
    }
  };

  const startHeroAutoScroll = () => {
    heroAutoScrollInterval.current = setInterval(() => {
      setHeroSlideIndex(prev => (prev + 1) % 3);
    }, 5000);
  };

  const stopHeroAutoScroll = () => {
    if (heroAutoScrollInterval.current) {
      clearInterval(heroAutoScrollInterval.current);
    }
  };

  const scrollSlider = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 380;
      ref.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const nextImage = (productId, images, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!images || images.length === 0) return;
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: (prev[productId] + 1) % images.length
    }));
  };

  const prevImage = (productId, images, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!images || images.length === 0) return;
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: (prev[productId] - 1 + images.length) % images.length
    }));
  };

  const toggleFavorite = async (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLoggedIn) {
      toast.error('Favorilere eklemek için giriş yapmalısınız!');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }
    
    setFavoriteAnim(prev => ({ ...prev, [productId]: true }));
    setTimeout(() => {
      setFavoriteAnim(prev => ({ ...prev, [productId]: false }));
    }, 500);
    
    try {
      const response = await api.post('/users/favorites/toggle', { productId });
      const isNowFavorite = response.data.isFavorite;

      if (isNowFavorite) {
        toast.success('❤️ Favorilere eklendi!');
      } else {
        toast.error('💔 Favorilerden çıkarıldı');
      }

      const updateProductLists = (list) => {
        return list.map(product => 
          product.id === productId 
            ? { 
                ...product, 
                isFavorite: response.data.isFavorite,
                favorite_count: response.data.isFavorite 
                  ? (product.favorite_count || 0) + 1 
                  : (product.favorite_count || 0) - 1 
              }
            : product
        );
      };
      
      setDiscountedProducts(prev => updateProductLists(prev));
      setNewProducts(prev => updateProductLists(prev));
      setFreeShippingProducts(prev => updateProductLists(prev));
      setRecommendedProducts(prev => updateProductLists(prev));
      
      setProducts(prev => prev.map(product =>
        product.id === productId
          ? { 
              ...product, 
              isFavorite: response.data.isFavorite,
              favorite_count: response.data.isFavorite 
                ? (product.favorite_count || 0) + 1 
                : (product.favorite_count || 0) - 1 
            }
          : product
      ));
      
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

  // Hero banner butonlarına tıklama fonksiyonu
  const handleHeroButtonClick = (categoryType) => {
    navigate(`/category-products/${categoryType}`);
  };

  const heroSlides = [
    {
      title: 'Yaz İndirimleri Başladı!',
      subtitle: 'Sezonun en yeni ürünlerinde %50\'ye varan indirimler',
      color: '#667eea',
      icon: '🔥',
      btnText: 'Hemen Alışverişe Başla',
      categoryType: 'discounted',
      condition: discountedProducts.length > 0,
      products: discountedProducts
    },
    {
      title: 'Yeni Sezon Ürünleri',
      subtitle: 'En trend ürünler kapında, hemen keşfet!',
      color: '#f59e0b',
      icon: '✨',
      btnText: 'Yeni Ürünleri Gör',
      categoryType: 'new',
      condition: newProducts.length > 0,
      products: newProducts
    },
    {
      title: 'Kargo Bedava Fırsatı',
      subtitle: 'Tüm alışverişlerde kargo bedava, kaçırma!',
      color: '#10b981',
      icon: '🚚',
      btnText: 'Hemen İncele',
      categoryType: 'freeshipping',
      condition: freeShippingProducts.length > 0,
      products: freeShippingProducts
    }
  ];

  const activeHeroSlides = heroSlides.filter(slide => slide.condition === true);
  const currentSlide = activeHeroSlides[heroSlideIndex % activeHeroSlides.length] || activeHeroSlides[0];

  const renderProductCard = (product, size = 'normal') => {
    if (!product) return null;
    
    const isOutOfStock = product.stock_quantity <= 0;
    const hasDiscount = product.discount > 0;
    const isNew = product.is_new === 1 || product.is_new === true;
    const hasFreeShipping = product.free_shipping === 1 || product.free_shipping === true;
    const discountedPrice = hasDiscount ? product.price - (product.price * product.discount / 100) : product.price;
    const avgRating = getRatingValue(product.avg_rating || product.rating);
    const totalReviews = product.total_reviews || product.rating_count || 0;
    const favoriteCount = product.favorite_count || 0;
    const isFavorite = product.isFavorite || false;
    const images = product.images || [];
    const hasMultipleImages = images.length > 1;
    const currentImgIndex = currentImageIndex[product.id] || 0;
    const currentImage = images[currentImgIndex] || null;
    const showAnimation = favoriteAnim[product.id];
    
    const cardWidth = size === 'small' ? 280 : 340;

    return (
      <Link
        key={product.id}
        to={`/product/${product.id}`}
        style={{
          width: `${cardWidth}px`,
          flexShrink: 0,
          background: 'white',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          transition: 'transform 0.3s, boxShadow 0.3s',
          textDecoration: 'none',
          display: 'block',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
        }}
      >
        <div
          style={{
            position: 'relative',
            height: `${cardWidth}px`,
            background: '#f8fafc',
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            const navBtns = e.currentTarget.querySelectorAll('.image-nav-btn');
            navBtns.forEach(btn => btn.style.opacity = '1');
          }}
          onMouseLeave={(e) => {
            const navBtns = e.currentTarget.querySelectorAll('.image-nav-btn');
            navBtns.forEach(btn => btn.style.opacity = '0');
          }}
        >
          {hasDiscount && !isOutOfStock && (
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: '#ef4444',
              color: 'white',
              fontSize: '12px',
              fontWeight: '800',
              padding: '5px 12px',
              borderRadius: '20px',
              zIndex: 5,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>🔥 -%{product.discount}</div>
          )}

          {/* SADECE is_new true ise göster */}
          {(isNew) && !isOutOfStock && !hasDiscount && (
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: '#10b981',
              color: 'white',
              fontSize: '12px',
              fontWeight: '800',
              padding: '5px 12px',
              borderRadius: '20px',
              zIndex: 5,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>✨ Yeni</div>
          )}

          {/* SADECE free_shipping true ise göster */}
          {(hasFreeShipping) && !isOutOfStock && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              fontSize: '11px',
              fontWeight: '700',
              padding: '4px 12px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              zIndex: 5,
            }}>
              <Truck size={12} /> Kargo Bedava
            </div>
          )}

          <button
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: isFavorite ? '#ef4444' : 'white',
              color: isFavorite ? 'white' : '#ef4444',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, background 0.2s',
              animation: showAnimation ? 'heartBeat 0.5s ease' : 'none',
            }}
            onClick={(e) => toggleFavorite(product.id, e)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Heart size={18} fill={isFavorite ? "white" : "none"} />
          </button>

          {hasMultipleImages && !isOutOfStock && (
            <>
              <button
                className="image-nav-btn"
                style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  opacity: 0,
                  transition: 'opacity 0.3s',
                  left: '10px',
                }}
                onClick={(e) => prevImage(product.id, images, e)}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="image-nav-btn"
                style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  opacity: 0,
                  transition: 'opacity 0.3s',
                  right: '10px',
                }}
                onClick={(e) => nextImage(product.id, images, e)}
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          <img
            src={getImageUrl(currentImage?.image_url || product.main_image || product.image_url)}
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />

          {hasMultipleImages && !isOutOfStock && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '6px',
              zIndex: 10,
            }}>
              {images.map((_, idx) => (
                <span
                  key={idx}
                  style={{
                    width: idx === currentImgIndex ? '16px' : '6px',
                    height: '6px',
                    borderRadius: idx === currentImgIndex ? '3px' : '50%',
                    background: idx === currentImgIndex ? 'white' : 'rgba(255,255,255,0.5)',
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </div>
          )}

          {isOutOfStock && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 5,
            }}>
              <span style={{
                background: 'white',
                padding: '8px 20px',
                borderRadius: '30px',
                fontWeight: '800',
                fontSize: '13px',
              }}>Tükendi</span>
            </div>
          )}
        </div>

        <div style={{ padding: '18px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '10px',
            marginBottom: '8px',
          }}>
            {hasDiscount && !isOutOfStock ? (
              <>
                <span style={{ fontSize: '14px', color: '#94a3b8', textDecoration: 'line-through' }}>
                  {formatPrice(product.price)} TL
                </span>
                <span style={{ fontSize: '22px', fontWeight: '900', color: '#ef4444' }}>
                  {formatDiscountedPrice(product.price, product.discount)} TL
                </span>
              </>
            ) : (
              <span style={{ fontSize: '22px', fontWeight: '900', color: '#1a1a2e' }}>
                {formatPrice(product.price)} TL
              </span>
            )}
          </div>

          <h3 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '8px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '44px',
            lineHeight: '1.4',
          }}>{product.name}</h3>

          <p style={{
            fontSize: '13px',
            color: '#64748b',
            lineHeight: '1.5',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '40px',
            marginBottom: '10px',
          }}>
            {product.description?.substring(0, 80) || "Premium kalite ürün"}
            {product.description?.length > 80 && "..."}
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            margin: '10px 0',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}>
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <span style={{
                fontSize: '13px',
                fontWeight: '700',
                color: '#f59e0b',
              }}>{avgRating.toFixed(1)}</span>
              <span style={{
                fontSize: '11px',
                color: '#94a3b8',
              }}>({formatNumber(totalReviews)})</span>
            </div>
          </div>

          <button
            style={{
              width: '100%',
              background: '#1a1a2e',
              color: 'white',
              padding: '12px',
              borderRadius: '14px',
              fontWeight: '700',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              border: 'none',
              marginTop: '12px',
              transition: 'background 0.3s',
            }}
            disabled={isOutOfStock}
            onClick={(e) => addToCart(product, e)}
            onMouseEnter={(e) => {
              if (!isOutOfStock) e.currentTarget.style.background = '#667eea';
            }}
            onMouseLeave={(e) => {
              if (!isOutOfStock) e.currentTarget.style.background = '#1a1a2e';
            }}
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
  };

  const renderSlider = (title, icon, iconColor, productsList, sliderRef, categoryType) => {
    if (productsList.length === 0) return null;
    
    return (
      <div style={{ marginBottom: '60px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
        }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '900',
            color: '#1a1a2e',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ color: iconColor }}>{icon}</span>
            {title}
          </h2>
          <Link to={`/category-products/${categoryType}`} style={{
            color: '#667eea',
            fontWeight: '700',
            textDecoration: 'none',
            fontSize: '14px',
          }}>Tümünü Gör →</Link>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
        }}>
          <button 
            style={{
              width: '44px',
              height: '44px',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '50%',
              cursor: 'pointer',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }} 
            onClick={() => scrollSlider(sliderRef, 'left')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#667eea';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = 'black';
            }}
          >
            <ChevronLeft size={20} />
          </button>

          <div style={{ overflowX: 'auto', flex: 1, padding: '10px 0', scrollBehavior: 'smooth' }} ref={sliderRef}>
            <div style={{ display: 'flex', gap: '25px' }}>
              {productsList.map(product => renderProductCard(product))}
            </div>
          </div>

          <button 
            style={{
              width: '44px',
              height: '44px',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '50%',
              cursor: 'pointer',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }} 
            onClick={() => scrollSlider(sliderRef, 'right')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#667eea';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = 'black';
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e2e8f0',
            borderTopColor: '#667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}></div>
        </div>
      </div>
    );
  }

  if (activeHeroSlides.length === 0) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '32px' }}>
          <h2>Ürün bulunmamaktadır</h2>
          <p>Lütfen daha sonra tekrar ziyaret edin.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes heartBeat {
          0% { transform: scale(1); }
          25% { transform: scale(1.3); }
          50% { transform: scale(1.1); }
          75% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .image-nav-btn:hover {
          background: #667eea !important;
          color: white !important;
        }
      `}</style>

      {/* Hero Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${currentSlide.color}, ${currentSlide.color}dd, #764ba2)`,
        borderRadius: '32px',
        padding: '50px 48px',
        marginBottom: '50px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.5s ease',
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '60%',
          height: '200%',
          background: 'rgba(255,255,255,0.1)',
          transform: 'rotate(25deg)',
          pointerEvents: 'none',
        }} />
        
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '30px' }}>
          <div style={{ maxWidth: '500px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>{currentSlide.icon}</div>
            <h1 style={{
              fontSize: '48px',
              fontWeight: '900',
              color: 'white',
              marginBottom: '16px',
              lineHeight: '1.1',
            }}>{currentSlide.title}</h1>
            <p style={{
              fontSize: '18px',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '30px',
              lineHeight: '1.5',
            }}>{currentSlide.subtitle}</p>
            <button 
              style={{
                background: 'white',
                color: currentSlide.color,
                padding: '14px 36px',
                borderRadius: '40px',
                fontWeight: '800',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'transform 0.3s, box-shadow 0.3s',
              }}
              onClick={() => handleHeroButtonClick(currentSlide.categoryType)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {currentSlide.btnText}
            </button>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
              {activeHeroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setHeroSlideIndex(idx);
                    stopHeroAutoScroll();
                    startHeroAutoScroll();
                  }}
                  style={{
                    width: heroSlideIndex === idx ? '30px' : '10px',
                    height: '10px',
                    borderRadius: '5px',
                    background: heroSlideIndex === idx ? 'white' : 'rgba(255,255,255,0.4)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                />
              ))}
            </div>
          </div>
          
          {currentSlide.products && currentSlide.products.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '20px',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '24px',
              padding: '20px',
              maxWidth: '600px',
              overflowX: 'auto',
            }}>
              {currentSlide.products.slice(0, 3).map(product => {
                const discountedPrice = product.discount ? product.price - (product.price * product.discount / 100) : product.price;
                return (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    style={{
                      width: '160px',
                      background: 'white',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      textDecoration: 'none',
                      transition: 'transform 0.3s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <img
                      src={getImageUrl(product.image_url)}
                      alt={product.name}
                      style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '12px' }}>
                      <p style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                        {product.name.substring(0, 30)}{product.name.length > 30 && '...'}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {product.discount > 0 && (
                          <span style={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'line-through' }}>{formatPrice(product.price)} TL</span>
                        )}
                        <span style={{ fontSize: '14px', fontWeight: '900', color: currentSlide.color }}>{Math.floor(discountedPrice)} TL</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 🔥 İndirimli Ürünler */}
      {discountedProducts.length > 0 && renderSlider(
        'Kaçırma Fırsatları',
        <Zap size={24} />,
        '#ef4444',
        discountedProducts,
        discountSliderRef,
        'discounted'
      )}

      {/* ✨ Yeni Ürünler */}
      {newProducts.length > 0 && renderSlider(
        'Yeni Ürünler',
        <Gift size={24} />,
        '#10b981',
        newProducts,
        newProductsSliderRef,
        'new'
      )}

      {/* 🎯 Önerilen Ürünler */}
      {recommendedProducts.length > 0 && renderSlider(
        'Önerilen Ürünler',
        <Award size={24} />,
        '#8b5cf6',
        recommendedProducts,
        recommendedSliderRef,
        'recommended'
      )}

      {/* 🚚 Kargo Bedava Ürünler */}
      {freeShippingProducts.length > 0 && renderSlider(
        'Kargo Bedava Ürünler',
        <Truck size={24} />,
        '#f59e0b',
        freeShippingProducts,
        freeShippingSliderRef,
        'freeshipping'
      )}
    </div>
  );
};

export default Home;