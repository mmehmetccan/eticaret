import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, ArrowLeft, ShieldCheck, Truck, Star, Heart, 
  AlertTriangle, ChevronLeft, ChevronRight, Send, X, Maximize2, 
  ZoomIn, ZoomOut, RotateCw
} from 'lucide-react';
import api from '../api/api';
import { toast } from 'react-toastify';
import { getImageUrl, formatPrice, formatDiscountedPrice } from '../utils/formatPrice';

import '../styles/ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  // Modal State'leri
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  
  // Zoom State'leri
  const [zoomScale, setZoomScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const imgRef = useRef(null);

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const topRef = useRef(null);

  // Sayfa açıldığında EN ÜSTE SCROLL YAP
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }, []);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    if (currentUser) {
      fetchUserReview();
    }
  }, [id]);

  // Klavye olayları için useEffect
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft') prevImageModal();
        if (e.key === 'ArrowRight') nextImageModal();
        if (e.key === '+' || e.key === '=') zoomIn();
        if (e.key === '-' || e.key === '_') zoomOut();
        if (e.key === 'r' || e.key === 'R') resetZoom();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'auto';
      };
    }
  }, [modalOpen, modalImageIndex, zoomScale]);

  const fetchProduct = async () => {
  try {
    const res = await api.get(`/products/${id}`);
    setProduct(res.data);
    
    // Kullanıcı giriş yapmışsa ve API'den isFavorite geliyorsa kullan
    if (res.data.isFavorite !== undefined) {
      setIsFavorite(res.data.isFavorite);
    } else {
      // Alternatif: ayrıca favori kontrolü yap
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const favRes = await api.get(`/users/favorites/check/${id}`);
          setIsFavorite(favRes.data.isFavorite);
        } catch (favErr) {
          console.error("Favori durumu kontrol edilemedi:", favErr);
        }
      }
    }
    
    if (res.data.images && res.data.images.length > 0) {
      setSelectedImage(res.data.images[0]);
    } else if (res.data.image_url) {
      setSelectedImage({ image_url: res.data.image_url });
    }
  } catch (err) {
    console.error("Ürün yüklenemedi", err);
  } finally {
    setLoading(false);
  }
};

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/product/${id}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Yorumlar yüklenemedi", err);
    }
  };

  const fetchUserReview = async () => {
    try {
      const res = await api.get(`/reviews/my-review/${id}`);
      if (res.data) {
        setUserReview(res.data);
        setReviewRating(res.data.rating);
        setReviewComment(res.data.comment);
      }
    } catch (err) {
      console.error("Kullanıcı yorumu yüklenemedi", err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Yorum yapmak için giriş yapmalısınız!');
      navigate('/login');
      return;
    }
    
    setSubmitting(true);
    try {
      await api.post('/reviews/add', {
        productId: id,
        rating: reviewRating,
        comment: reviewComment
      });
      toast.success(userReview ? '✏️ Yorumunuz güncellendi!' : '✨ Yorumunuz eklendi!');
      fetchReviews();
      fetchProduct();
      fetchUserReview();
      setReviewComment('');
    } catch (err) {
      toast.error('Yorum eklenirken hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const addToCart = async () => {
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
      await api.post('/cart/add', { productId: id, quantity: 1 });
      toast.success(`🎉 ${product.name} sepete eklendi!`, { duration: 2000 });
    } catch (err) {
      toast.error(err.response?.data?.error || '❌ Sepete eklenemedi.');
    }
  };

  const toggleFavorite = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    toast.error('Favorilere eklemek için giriş yapmalısınız!');
    setTimeout(() => navigate('/login'), 1500);
    return;
  }
  try {
    const response = await api.post('/users/favorites/toggle', { productId: id });
    setIsFavorite(response.data.isFavorite);
    if (response.data.isFavorite) {
      toast.success('Favorilere eklendi!');
    } else {
      toast.info('Favorilerden çıkarıldı');
    }
  } catch (err) {
    toast.error('Favori işlemi başarısız!');
  }
};

  const nextImage = () => {
    if (product?.images && product.images.length > 0) {
      const nextIndex = (currentImageIndex + 1) % product.images.length;
      setCurrentImageIndex(nextIndex);
      setSelectedImage(product.images[nextIndex]);
    }
  };

  const prevImage = () => {
    if (product?.images && product.images.length > 0) {
      const prevIndex = (currentImageIndex - 1 + product.images.length) % product.images.length;
      setCurrentImageIndex(prevIndex);
      setSelectedImage(product.images[prevIndex]);
    }
  };

  // Modal Fonksiyonları
  const openModal = (index) => {
    setModalImageIndex(index);
    setModalOpen(true);
    resetZoom();
  };

  const closeModal = () => {
    setModalOpen(false);
    resetZoom();
  };

  const nextImageModal = () => {
    if (product?.images && product.images.length > 0) {
      const newIndex = (modalImageIndex + 1) % product.images.length;
      setModalImageIndex(newIndex);
      resetZoom();
    }
  };

  const prevImageModal = () => {
    if (product?.images && product.images.length > 0) {
      const newIndex = (modalImageIndex - 1 + product.images.length) % product.images.length;
      setModalImageIndex(newIndex);
      resetZoom();
    }
  };

  // Zoom Fonksiyonları
  const zoomIn = () => {
    setZoomScale(prev => Math.min(prev + 0.5, 5));
  };

  const zoomOut = () => {
    setZoomScale(prev => Math.max(prev - 0.5, 0.5));
  };

  const resetZoom = () => {
    setZoomScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const rotateImage = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Fare ile sürükleme (drag) için
  const handleMouseDown = (e) => {
    if (zoomScale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomScale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="product-detail-spinner"></div>
        <p className="product-detail-loading-text">Yükleniyor...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-error">
        <p className="product-detail-error-text">Ürün bulunamadı.</p>
      </div>
    );
  }

  const isOutOfStock = product.stock_quantity <= 0;
  const hasDiscount = product.discount > 0;
  const images = product.images || [];
  const hasMultipleImages = images.length > 1;
  const avgRating = parseFloat(product.avg_rating || 0).toFixed(1);
  const totalReviews = product.total_reviews || 0;

  return (
    <div className="product-detail" ref={topRef}>
      <button onClick={() => navigate(-1)} className="product-detail-back-btn">
        <ArrowLeft size={20} />
        Geri Dön
      </button>

      <div className="product-detail-card">
        {/* Görsel Alanı */}
        <div className="product-detail-image-section">
          <div className="product-detail-main-image" onClick={() => openModal(currentImageIndex)}>
            <img 
              src={getImageUrl(selectedImage?.image_url || product.image_url)} 
              alt={product.name}
              className={isOutOfStock ? 'product-detail-image-grayscale' : ''}
              style={{ opacity: isOutOfStock ? 0.5 : 1, cursor: 'pointer' }}
            />
            {hasMultipleImages && (
              <div className="image-zoom-icon">
                <Maximize2 size={20} />
              </div>
            )}
          </div>
          
          {/* Thumbnail'ler */}
          {images.length > 0 && (
            <div className="product-detail-thumbnails">
              {images.map((img, idx) => (
                <div 
                  key={img.id} 
                  className={`thumbnail ${selectedImage?.id === img.id ? 'thumbnail-active' : ''}`}
                  onClick={() => {
                    setSelectedImage(img);
                    setCurrentImageIndex(idx);
                  }}
                >
                  <img 
                    src={getImageUrl(img.image_url)} 
                    alt={`Görsel ${idx + 1}`}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
              ))}
            </div>
          )}
          
          <button onClick={toggleFavorite} className={`product-detail-fav-btn ${isFavorite ? 'fav-active' : 'fav-inactive'}`}>
            <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
          </button>

          {isOutOfStock && (
            <div className="product-detail-stock-overlay">
              <span className="product-detail-stock-badge">Tükendi</span>
            </div>
          )}
        </div>

        {/* Bilgi Alanı */}
        <div className="product-detail-info">
          <div>
            <div className="product-detail-header">
              <span className="product-detail-category">{product.category || 'Kategori'}</span>
              <div className="product-detail-badges">
                {hasDiscount && !isOutOfStock && (
                  <span className="discount-badge">
                    -%{product.discount > 100 ? product.discount / 100 : product.discount}
                  </span>
                )}
                {(product.free_shipping === 1 || product.free_shipping === true) && !isOutOfStock && (
                  <span className="free-shipping-badge">🚚 Kargo Bedava</span>
                )}
                {(product.is_new === 1 || product.is_new === true) && !isOutOfStock && (
                  <span className="new-badge">✨ Yeni</span>
                )}
              </div>
            </div>
            
            <h1 className="product-detail-name">{product.name}</h1>
            
            {/* Değerlendirme kısmı - class kalsın içi boş */}
            <div className="product-detail-rating"></div>
          </div>

          <p className="product-detail-description">
            {product.description || "Özel tasarım ve MCG Shop kalitesiyle hazırlanan bu ürün, tarzınıza değer katmak için sizi bekliyor."}
          </p>

          <div className="product-detail-price-card">
            <div>
              <p className="product-detail-price-label">Peşin Fiyat</p>
              <div className="product-detail-prices">
                {hasDiscount && !isOutOfStock ? (
                  <>
                    <span className="product-price-original">{formatPrice(product.price)} TL</span>
                    <span className="product-price-discount">{formatDiscountedPrice(product.price, product.discount)} TL</span>
                  </>
                ) : (
                  <span className="product-price-current">{formatPrice(product.price)} TL</span>
                )}
              </div>
            </div>
            <button disabled={isOutOfStock} onClick={addToCart} className={`product-detail-add-btn ${isOutOfStock ? 'btn-add-disabled' : 'btn-add-active'}`}>
              {isOutOfStock ? <><AlertTriangle size={24} /> STOKTA BULUNMUYOR</> : <><ShoppingCart size={24} /> SEPETE EKLE</>}
            </button>
          </div>

          <div className="product-detail-footer">
            <div className="product-detail-footer-item">
              <Truck size={24} color="#3b82f6" />
              <span className="product-detail-footer-text">Ücretsiz <br/> Hızlı Kargo</span>
            </div>
            <div className="product-detail-footer-item">
              <ShieldCheck size={24} color="#10b981" />
              <span className="product-detail-footer-text">Orijinal <br/> Ürün Garantisi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Yorumlar ve Detaylar Tab */}
      <div className="product-detail-tabs">
        <div className="tabs-header">
          <button className={`tab-btn ${activeTab === 'details' ? 'tab-active' : ''}`} onClick={() => setActiveTab('details')}>
            Ürün Detayları
          </button>
          <button className={`tab-btn ${activeTab === 'reviews' ? 'tab-active' : ''}`} onClick={() => setActiveTab('reviews')}>
            Yorumlar ({totalReviews})
          </button>
        </div>

        <div className="tabs-content">
          {activeTab === 'details' && (
            <div className="product-details-content fade-in">
              <h3>Ürün Özellikleri</h3>
              <ul className="specs-list">
                <li><strong>Kategori:</strong> {product.category}</li>
                <li><strong>Stok Durumu:</strong> {isOutOfStock ? 'Tükendi' : `${product.stock_quantity} Adet`}</li>
                <li><strong>Ürün Kodu:</strong> #{product.id}</li>
              </ul>

              {product.description && (
                <>
                  <h3>Ürün Açıklaması</h3>
                  <p className="short-description-text">{product.description}</p>
                </>
              )}

              {product.details && (
                <div className="rich-details-section">
                  <h3>Detaylı Ürün Bilgileri</h3>
                  <div 
                    className="details-html-render"
                    dangerouslySetInnerHTML={{ __html: product.details }} 
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-section">
              <div className="review-form-card">
                <h3>{userReview ? 'Yorumunu Güncelle' : 'Yorum Yap'}</h3>
                <form onSubmit={handleSubmitReview}>
                  <div className="rating-input">
                    <label>Puanınız:</label>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`star-btn ${reviewRating >= star ? 'active' : ''}`}
                          onClick={() => setReviewRating(star)}
                        >
                          <Star size={24} fill={reviewRating >= star ? "#f59e0b" : "none"} color={reviewRating >= star ? "#f59e0b" : "#cbd5e1"} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    className="review-textarea"
                    placeholder="Ürün hakkındaki düşüncelerinizi yazın..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows="4"
                  />
                  <button type="submit" className="submit-review-btn" disabled={submitting}>
                    <Send size={16} />
                    {submitting ? 'Gönderiliyor...' : (userReview ? 'Yorumu Güncelle' : 'Yorum Gönder')}
                  </button>
                </form>
              </div>

              <div className="reviews-list">
                {reviews.length === 0 ? (
                  <p className="no-reviews">Henüz yorum yapılmamış. İlk yorumu sen yap!</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <div className="review-user">
                          <div className="review-avatar">
                            {review.full_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="review-user-name">{review.full_name}</p>
                            <p className="review-date">{new Date(review.created_at).toLocaleDateString('tr-TR')}</p>
                          </div>
                        </div>
                        <div className="review-rating">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} size={14} fill={i <= review.rating ? "#f59e0b" : "none"} color={i <= review.rating ? "#f59e0b" : "#cbd5e1"} />
                          ))}
                        </div>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL - ZOOM ÖZELLİKLİ BÜYÜK RESİM GÖSTERİMİ */}
      {modalOpen && (
        <div className="image-modal-overlay" onClick={closeModal}>
          <div className="image-modal-container" onClick={(e) => e.stopPropagation()}>
            {/* Kapatma Butonu */}
            <button className="image-modal-close" onClick={closeModal}>
              <X size={28} />
            </button>

            {/* Zoom Kontrol Butonları */}
            <div className="image-modal-zoom-controls">
              <button onClick={zoomOut} className="zoom-btn" title="Uzaklaştır (-)">
                <ZoomOut size={22} />
              </button>
              <span className="zoom-level">{Math.round(zoomScale * 100)}%</span>
              <button onClick={zoomIn} className="zoom-btn" title="Yakınlaştır (+)">
                <ZoomIn size={22} />
              </button>
              <button onClick={rotateImage} className="zoom-btn" title="Döndür (R)">
                <RotateCw size={22} />
              </button>
              <button onClick={resetZoom} className="zoom-btn reset-btn" title="Sıfırla">
                Sıfırla
              </button>
            </div>
            
            {/* Ana Resim Alanı - Sürüklenebilir */}
            <div 
              className="image-modal-main"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: zoomScale > 1 ? 'grab' : 'default' }}
            >
              <img 
                ref={imgRef}
                src={getImageUrl(images[modalImageIndex]?.image_url || product.image_url)} 
                alt={product.name}
                className="image-modal-img"
                style={{ 
                  transform: `scale(${zoomScale}) rotate(${rotation}deg) translate(${position.x / zoomScale}px, ${position.y / zoomScale}px)`,
                  transition: isDragging ? 'none' : 'transform 0.2s ease',
                  cursor: zoomScale > 1 ? 'grab' : 'default'
                }}
                draggable={false}
              />
            </div>
            
            {/* Navigasyon Butonları */}
            {hasMultipleImages && (
              <>
                <button className="image-modal-nav image-modal-prev" onClick={prevImageModal}>
                  <ChevronLeft size={36} />
                </button>
                <button className="image-modal-nav image-modal-next" onClick={nextImageModal}>
                  <ChevronRight size={36} />
                </button>
              </>
            )}
            
            {/* Alt Bilgi ve Thumbnail'ler - getImageUrl ile güncellendi */}
            {hasMultipleImages && (
              <div className="image-modal-footer">
                <div className="image-modal-counter">
                  {modalImageIndex + 1} / {images.length}
                </div>
                <div className="image-modal-thumbnails">
                  {images.map((img, idx) => (
                    <div 
                      key={idx}
                      className={`modal-thumbnail-item ${idx === modalImageIndex ? 'active' : ''}`}
                      onClick={() => {
                        setModalImageIndex(idx);
                        resetZoom();
                      }}
                    >
                      <img 
                        src={getImageUrl(img.image_url)} 
                        alt={`Küçük resim ${idx + 1}`} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;