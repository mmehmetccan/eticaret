import { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  ShoppingBag, MapPin, CreditCard, ChevronRight, Truck, 
  ShieldCheck, CheckCircle2, ArrowLeft, Package, Trash2, 
  Sparkles, Globe, Plus, Minus, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import turkeyData from '../data/turkey_data.json';
import { toast } from 'react-toastify';
import { formatPrice, getImageUrl } from '../utils/formatPrice';

import '../styles/cart.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    city: '', district: '', address_detail: '', zip_code: '',
    shipping_method: 'Standard', installment: 1,
    card_no: '', card_name: '', card_exp: '', card_cvv: ''
  });

  const fetchCart = async () => {
    try { 
      const res = await api.get('/cart'); 
      setCartItems(res.data); 
    } catch (err) { 
      console.error(err); 
    }
  };
  
  useEffect(() => { 
    fetchCart(); 
  }, []);

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const increaseQuantity = async (productId) => {
    try {
      await api.post('/cart/add', { productId, quantity: 1 });
      fetchCart();
      toast.success('📦 Ürün adedi artırıldı!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'İşlem başarısız.');
    }
  };

  const decreaseQuantity = async (productId) => {
    try {
      await api.delete(`/cart/${productId}`);
      fetchCart();
      toast.success('📦 Ürün adedi azaltıldı!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'İşlem başarısız.');
    }
  };

  const removeItemCompletely = async (productId, productName) => {
    const confirmDelete = window.confirm(`${productName} ürününü sepetten tamamen kaldırmak istediğinize emin misiniz?`);
    if (!confirmDelete) return;
    
    try {
      const item = cartItems.find(i => i.product_id === productId);
      if (item) {
        for (let i = 0; i < item.quantity; i++) {
          await api.delete(`/cart/${productId}`);
        }
        fetchCart();
        toast.success(`🗑️ ${productName} sepetten kaldırıldı!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Silme işlemi başarısız.');
    }
  };

  const formatCardNumber = (value) => {
    return value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim().substring(0, 19);
  };

  const formatExpiry = (value) => {
    let v = value.replace(/\s+/g, '').replace(/\//g, '');
    if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
    return v.substring(0, 5);
  };

  const formatCVV = (value) => {
    return value.replace(/\D/g, '').substring(0, 3);
  };

  const handleCityChange = (cityName) => {
    const districts = turkeyData
      .filter(item => item.il === cityName)
      .map(item => item.ilce);
    
    if (districts.length > 0) {
      setAvailableDistricts(districts);
      setFormData({ ...formData, city: cityName, district: '' });
    } else {
      setAvailableDistricts([]);
      setFormData({ ...formData, city: '', district: '' });
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const payload = {
        shipping_address: formData.address_detail,
        city: formData.city,
        district: formData.district,
        zip_code: formData.zip_code,
        shipping_method: formData.shipping_method,
        installment: formData.installment
      };
      await api.post('/cart/checkout', payload);
      setCurrentStep(4);
      toast.success('🎉 Siparişiniz başarıyla oluşturuldu!');
    } catch (err) {
      toast.error('Ödeme sırasında bir hata oluştu. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  // Sepet Boşsa
  if (cartItems.length === 0 && currentStep !== 4) return (
    <div className="empty-cart">
      <ShoppingBag size={80} className="empty-cart-icon" />
      <h2 className="empty-cart-title">Sepetin Henüz Boş</h2>
      <p className="empty-cart-subtitle">Alışverişe başlamak için ürünleri inceleyin!</p>
      <button onClick={() => navigate('/')} className="empty-cart-btn">
        Alışverişe Başla
      </button>
    </div>
  );

  return (
    <div className="cart-container">
      {/* Step Progress Bar */}
      {currentStep < 4 && (
        <div className="step-progress">
          {[1, 2, 3].map((s) => (
            <div key={s} className="step-item">
              <div className={`step-number ${currentStep > s ? 'step-completed' : currentStep === s ? 'step-active' : 'step-inactive'}`}>
                {currentStep > s ? <CheckCircle2 size={20} /> : s}
              </div>
              {s < 3 && <div className={`step-line ${currentStep > s ? 'step-line-active' : ''}`}></div>}
            </div>
          ))}
        </div>
      )}

      {/* ADIM 1: ÜRÜN İNCELEME */}
      {currentStep === 1 && (
        <div className="cart-grid">
          <div className="cart-items-section">
            <h2 className="cart-items-title">Ürünlerinizi İnceleyin</h2>
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item-card">
                <div className="cart-item-image">
                  <img src={getImageUrl(item.image_url)} alt={item.name} />
                </div>
                <div className="cart-item-details">
                  <div>
                    <h3 className="cart-item-name">{item.name}</h3>
                    <p className="cart-item-price">{formatPrice(item.price)} TL</p>
                  </div>
                  
                  <div className="quantity-controls">
                    <div className="quantity-buttons">
                      <button 
                        onClick={() => decreaseQuantity(item.product_id)}
                        className="quantity-btn quantity-btn-decrease"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button 
                        onClick={() => increaseQuantity(item.product_id)}
                        className="quantity-btn quantity-btn-increase"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <div className="item-total">
                      <span className="item-total-price">Toplam: {formatPrice(item.price * item.quantity)} TL</span>
                      <button 
                        onClick={() => removeItemCompletely(item.product_id, item.name)}
                        className="delete-btn"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Sepet Özeti */}
          <div className="cart-summary">
            <p className="cart-summary-label">Sepet Toplamı</p>
            <h3 className="cart-summary-total">{formatPrice(totalPrice)} TL</h3>
            <button onClick={() => setCurrentStep(2)} className="checkout-btn">
              Teslimat Bilgilerine Geç <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ADIM 2: TESLİMAT BİLGİLERİ */}
      {currentStep === 2 && (
        <div className="address-form-container">
          <button onClick={() => setCurrentStep(1)} className="back-btn">
            <ArrowLeft size={20} /> Geri Dön
          </button>

          <div className="address-card">
            <MapPin size={120} className="address-icon" />
            <h2 className="address-title">
              <MapPin className="address-icon-small" /> Nereye Gönderelim?
            </h2>

            <div className="address-grid">
              <div>
                <label className="form-label">Şehir</label>
                <div className="select-wrapper">
                  <select 
                    className="form-select"
                    value={formData.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                  >
                    <option value="">Şehir Seçiniz</option>
                    {[...new Set(turkeyData.map(item => item.il))].sort((a, b) => a.localeCompare(b, 'tr')).map((cityName, index) => (
                      <option key={index} value={cityName}>{cityName}</option>
                    ))}
                  </select>
                  <ChevronRight className="select-arrow" size={20} />
                </div>
              </div>

              <div>
                <label className="form-label">İlçe</label>
                <div className="select-wrapper">
                  <select 
                    disabled={!formData.city}
                    className="form-select"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  >
                    <option value="">İlçe Seçiniz</option>
                    {availableDistricts.sort((a, b) => a.localeCompare(b, 'tr')).map((ilceName, index) => (
                      <option key={index} value={ilceName}>{ilceName}</option>
                    ))}
                  </select>
                  <ChevronRight className="select-arrow" size={20} />
                </div>
              </div>

              <div className="address-full">
                <label className="form-label">Detaylı Adres Bilgisi</label>
                <textarea 
                  placeholder="Mahalle, Sokak, Kapı No, Daire..." 
                  className="form-textarea"
                  value={formData.address_detail}
                  onChange={(e) => setFormData({...formData, address_detail: e.target.value})} 
                />
              </div>
              
              <div className="shipping-methods">
                <p className="shipping-title">Teslimat Yöntemi</p>
                <div className="shipping-grid">
                  <button 
                    onClick={() => setFormData({...formData, shipping_method: 'Standard'})} 
                    className={`shipping-option ${formData.shipping_method === 'Standard' ? 'shipping-option-active' : ''}`}
                  >
                    <p className="shipping-option-title">
                      <Truck size={20} /> Standart Kargo
                    </p>
                    <p className="shipping-option-desc">2-4 İş Günü (Ücretsiz)</p>
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, shipping_method: 'Express'})} 
                    className={`shipping-option ${formData.shipping_method === 'Express' ? 'shipping-option-active' : ''}`}
                  >
                    <p className="shipping-option-title">
                      <Sparkles size={20} /> Hızlı Kargo
                    </p>
                    <p className="shipping-option-desc">Yarın Kapında (+29 TL)</p>
                  </button>
                </div>
              </div>
            </div>

            <button 
              disabled={!formData.city || !formData.district || formData.address_detail.length < 10}
              onClick={() => setCurrentStep(3)} 
              className="next-btn"
            >
              Ödeme Bilgilerine Geç <ChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* ADIM 3: ÖDEME BİLGİLERİ */}
      {currentStep === 3 && (
        <div className="address-form-container">
          <button onClick={() => setCurrentStep(2)} className="back-btn">
            <ArrowLeft size={20} /> Geri Dön
          </button>
          
          <div className="payment-card">
            <h2 className="payment-title">
              <CreditCard /> Güvenli Ödeme
            </h2>
            
            <div className="payment-form">
              <input 
                type="text" 
                placeholder="KART ÜZERİNDEKİ İSİM" 
                className="payment-input"
                value={formData.card_name}
                onChange={(e) => setFormData({...formData, card_name: e.target.value.toUpperCase()})}
              />
              <input 
                type="text" 
                placeholder="0000 0000 0000 0000" 
                className="payment-input"
                value={formData.card_no}
                onChange={(e) => setFormData({...formData, card_no: formatCardNumber(e.target.value)})}
              />
              <div className="payment-row">
                <input 
                  type="text" 
                  placeholder="AA / YY" 
                  className="payment-input"
                  value={formData.card_exp}
                  onChange={(e) => setFormData({...formData, card_exp: formatExpiry(e.target.value)})}
                />
                <input 
                  type="text" 
                  placeholder="CVV" 
                  className="payment-input"
                  value={formData.card_cvv}
                  onChange={(e) => setFormData({...formData, card_cvv: formatCVV(e.target.value)})}
                />
              </div>
              
              <div>
                <p className="installment-title">Taksit Seçenekleri</p>
                <div className="installment-grid">
                  {[1, 3, 6].map((t) => (
                    <button 
                      key={t} 
                      onClick={() => setFormData({...formData, installment: t})} 
                      className={`installment-option ${formData.installment === t ? 'installment-option-active' : ''}`}
                    >
                      {t === 1 ? 'Tek Çekim' : `${t} Taksit`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="security-badge">
              <ShieldCheck size={32} /> %100 Güvenli Ödeme Altyapısı ile şifrelenmiştir.
            </div>
            
            <button onClick={handleCheckout} disabled={loading} className="pay-btn">
              {loading ? "İşleniyor..." : `Ödemeyi Tamamla (${formatPrice(totalPrice)} TL)`}
            </button>
          </div>
        </div>
      )}

      {/* ADIM 4: BAŞARI SAYFASI */}
      {currentStep === 4 && (
        <div className="success-container">
          <div className="success-icon">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="success-title">Siparişiniz Alındı! 🎉</h2>
          <p className="success-message">Teşekkür ederiz! Ürünlerinizi en kısa sürede hazırlayıp yola çıkaracağız.</p>
          
          <div className="order-summary">
            <h3 className="order-summary-title">Sipariş Özeti</h3>
            <div className="order-summary-row">
              <span>Teslimat Adresi:</span>
              <span>{formData.city} / {formData.district}</span>
            </div>
            <div className="order-summary-row">
              <span>Kargo:</span>
              <span>{formData.shipping_method}</span>
            </div>
            <div className="order-summary-total">
              <span>Toplam Ödenen:</span>
              <span>{formatPrice(totalPrice)} TL</span>
            </div>
          </div>

          <div className="success-buttons">
            <button onClick={() => navigate('/profile')} className="success-btn-outline">
              <Package size={20} /> Siparişlerime Git
            </button>
            <button onClick={() => navigate('/')} className="success-btn-primary">
              <ShoppingBag size={20} /> Alışverişe Devam Et
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;