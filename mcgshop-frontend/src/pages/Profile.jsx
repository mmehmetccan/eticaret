import { useState, useEffect } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import api from '../api/api';
import { toast } from 'react-toastify';
import { formatPrice, formatDiscountedPrice, getImageUrl } from '../utils/formatPrice';
import { 
  User, Package, Settings, Save, CheckCircle, Clock, 
  Truck, ChevronDown, ChevronUp, ShoppingBag, MapPin, 
  Mail, Phone, Sparkles, Heart, CreditCard, Trash2, LogOut,
  Lock, Eye, EyeOff, AlertCircle
} from 'lucide-react';
import '../styles/Profile.css';

const Profile = () => {
  const [userInfo, setUserInfo] = useState({
    full_name: '', email: '', phone_number: '', gender: '', birth_date: ''
  });
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  // Şifre değiştirme state'leri
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const navigate = useNavigate();
const location = useLocation();

useEffect(() => {
    // Navbar'dan gelen state'i kontrol et
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [orderRes, userRes, favRes] = await Promise.allSettled([
        api.get('/users/my-orders'),
        api.get('/users/profile'),
        api.get('/users/favorites')
      ]);

      if (orderRes.status === 'fulfilled') setOrders(orderRes.value.data);
      if (favRes.status === 'fulfilled') setFavorites(favRes.value.data);
      
      if (userRes.status === 'fulfilled' && userRes.value.data) {
        setUserInfo(userRes.value.data);
      } else {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        if (savedUser) setUserInfo(prev => ({ ...prev, ...savedUser }));
      }
    } catch (err) {
      console.error("Veri yükleme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };


  const handlePhoneChange = (e) => {
  let value = e.target.value.replace(/\D/g, ''); // Sadece rakamları al
  if (value.length > 10) value = value.slice(0, 10); // Maksimum 10 karakter
  setUserInfo({...userInfo, phone_number: value});
};

  const handleUpdate = async (e) => {
  e.preventDefault();
  try {
    await api.put('/users/update-profile', userInfo);
    localStorage.setItem('user', JSON.stringify(userInfo));
    toast.success('✅ Bilgileriniz başarıyla güncellendi!');
  } catch (err) {
    toast.error(err.response?.data?.error || 'Güncelleme sırasında bir hata oluştu.');
  }
};

// handlePasswordChange fonksiyonunu güncelleyin
const handlePasswordChange = async (e) => {
  e.preventDefault();
  setPasswordError('');
  setPasswordSuccess('');
  
  if (!passwordData.current_password) {
    toast.error('Mevcut şifrenizi giriniz!');
    return;
  }
  if (!passwordData.new_password) {
    toast.error('Yeni şifrenizi giriniz!');
    return;
  }
  if (passwordData.new_password.length < 6) {
    toast.error('Şifre en az 6 karakter olmalıdır!');
    return;
  }
  if (passwordData.new_password !== passwordData.confirm_password) {
    toast.error('Yeni şifre ve onay şifresi eşleşmiyor!');
    return;
  }
  
  setUpdatingPassword(true);
  try {
    await api.put('/users/update-profile', {
      ...userInfo,
      current_password: passwordData.current_password,
      new_password: passwordData.new_password,
      confirm_password: passwordData.confirm_password
    });
    toast.success('🔒 Şifreniz başarıyla güncellendi!');
    setPasswordData({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    setShowChangePassword(false);
  } catch (err) {
    toast.error(err.response?.data?.error || 'Şifre güncellenirken bir hata oluştu!');
  } finally {
    setUpdatingPassword(false);
  }
};

  const removeFavorite = async (productId) => {
  try {
    await api.post('/users/favorites/toggle', { productId });
    setFavorites(favorites.filter(f => f.id !== productId));
    toast.success('Favorilerden çıkarıldı');
  } catch (err) {
    toast.error('Hata oluştu');
  }
};

  const getStatusLabel = (status) => {
    const labels = { delivered: 'Teslim Edildi', shipped: 'Kargoda', processing: 'Hazırlanıyor', pending: 'Bekliyor', cancelled: 'İptal Edildi' };
    return labels[status] || 'İşleniyor';
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'delivered': return 'status-delivered';
      case 'shipped': return 'status-shipped';
      case 'processing': return 'status-processing';
      case 'pending': return 'status-pending';
      default: return 'status-cancelled';
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner"></div>
        <p className="profile-loading-text">Yükleniyor...</p>
      </div>
    );
  }

  const firstName = userInfo.full_name?.split(' ')[0] || 'Misafir';

  return (
    <div className="profile-container">
      {/* Hero Banner */}
      <div className="profile-hero">
        <div className="profile-hero-content">
          <div className="profile-avatar">
            {userInfo.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="profile-hero-text">
            <h1 className="profile-welcome">Merhaba, {firstName}! ✨</h1>
            <p className="profile-subtitle">Hesabını buradan yönetebilirsin.</p>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <button 
            onClick={() => setActiveTab('info')}
            className={`profile-menu-item ${activeTab === 'info' ? 'profile-menu-item-active' : 'profile-menu-item-inactive'}`}
          >
            <div className={`profile-menu-icon ${activeTab === 'info' ? 'profile-menu-icon-active' : 'profile-menu-icon-inactive'}`}>
              <User size={20} />
            </div>
            <span>Bilgilerim</span>
          </button>

          <button 
            onClick={() => setActiveTab('orders')}
            className={`profile-menu-item ${activeTab === 'orders' ? 'profile-menu-item-active' : 'profile-menu-item-inactive'}`}
          >
            <div className={`profile-menu-icon ${activeTab === 'orders' ? 'profile-menu-icon-active' : 'profile-menu-icon-inactive'}`}>
              <Package size={20} />
            </div>
            <span>Siparişlerim</span>
          </button>

          <button 
            onClick={() => setActiveTab('favorites')}
            className={`profile-menu-item ${activeTab === 'favorites' ? 'profile-menu-item-active' : 'profile-menu-item-inactive'}`}
          >
            <div className={`profile-menu-icon ${activeTab === 'favorites' ? 'profile-menu-icon-active' : 'profile-menu-icon-inactive'}`}>
              <Heart size={20} />
            </div>
            <span>Favorilerim</span>
          </button>

          <div className="profile-divider"></div>

          <button onClick={handleLogout} className="profile-logout-btn">
            <div className="profile-logout-icon">
              <LogOut size={20} />
            </div>
            <span>Güvenli Çıkış</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="profile-content">
          
          {/* TAB 1: BİLGİLER */}
          {activeTab === 'info' && (
            <div className="profile-info-card">
              <h3 className="profile-section-title">
                <Settings size={24} color="#4f46e5" />
                Profil Detayları
              </h3>
              <form onSubmit={handleUpdate} className="profile-form">
                <div className="profile-form-grid">
                  <div className="profile-form-group">
                    <label className="profile-label">
                      <User size={14} color="#4f46e5" />
                      Ad Soyad
                    </label>
                    <input 
                      type="text" 
                      value={userInfo.full_name || ''} 
                      onChange={(e) => setUserInfo({...userInfo, full_name: e.target.value})}
                      className="profile-input"
                    />
                  </div>
                  <div className="profile-form-group">
                    <label className="profile-label">
                      <Mail size={14} color="#4f46e5" />
                      E-Posta
                    </label>
                    <input 
                      type="email" 
                      value={userInfo.email || ''} 
                      onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                      className="profile-input"
                    />
                  </div>
                  <div className="profile-form-group">
                    <label className="profile-label">
                      <Phone size={14} color="#4f46e5" />
                     Telefon Numarası
  </label>
  <input 
    type="tel" 
    value={userInfo.phone_number || ''} 
    onChange={handlePhoneChange}
    className="profile-input"
    placeholder="5xx xxx xx xx"
    maxLength={10}
  />
                  </div>
                </div>
                <button type="submit" className="profile-save-btn">
                  <Save size={18} />
                  Değişiklikleri Kaydet
                </button>
              </form>

              {/* Şifre Değiştirme Bölümü */}
              <div className="profile-password-section">
                <div className="profile-password-header">
                  <h4 className="profile-password-title">
                    <Lock size={18} color="#4f46e5" />
                    Şifre Değiştir
                  </h4>
                  <button 
                    type="button"
                    className="profile-toggle-password-btn"
                    onClick={() => setShowChangePassword(!showChangePassword)}
                  >
                    {showChangePassword ? 'İptal Et' : 'Şifre Değiştir'}
                  </button>
                </div>

                {showChangePassword && (
                  <form onSubmit={handlePasswordChange} className="profile-password-form">
                    {passwordError && (
                      <div className="profile-alert profile-alert-error">
                        <AlertCircle size={18} />
                        <span>{passwordError}</span>
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="profile-alert profile-alert-success">
                        <CheckCircle size={18} />
                        <span>{passwordSuccess}</span>
                      </div>
                    )}

                    <div className="profile-form-group">
                      <label className="profile-label">Mevcut Şifre</label>
                      <div className="password-input-wrapper">
                        <input 
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                          className="profile-input"
                          placeholder="••••••••"
                          required
                        />
                        <button 
                          type="button"
                          className="password-toggle-icon"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="profile-form-group">
                      <label className="profile-label">Yeni Şifre</label>
                      <div className="password-input-wrapper">
                        <input 
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                          className="profile-input"
                          placeholder="••••••••"
                          required
                        />
                        <button 
                          type="button"
                          className="password-toggle-icon"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="profile-form-group">
                      <label className="profile-label">Yeni Şifre (Tekrar)</label>
                      <div className="password-input-wrapper">
                        <input 
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                          className="profile-input"
                          placeholder="••••••••"
                          required
                        />
                        <button 
                          type="button"
                          className="password-toggle-icon"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="profile-password-submit"
                      disabled={updatingPassword}
                    >
                      {updatingPassword ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SİPARİŞLER */}
          {activeTab === 'orders' && (
            <div>
              <h3 className="profile-section-title">
                <Package size={24} color="#8b5cf6" />
                Sipariş Geçmişi
              </h3>
              
              {orders.length === 0 ? (
                <div className="profile-empty-state">
                  <ShoppingBag size={80} color="#e2e8f0" />
                  <p className="profile-empty-text">Henüz bir siparişin yok!</p>
                </div>
              ) : (
                orders.map((order) => {
                  const isExpanded = expandedOrder === order.id;
                  const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || order.total_items || 0;
                  
                  return (
                    <div key={order.id} className="profile-order-card">
                      <div className="profile-order-header">
                        <div className="profile-order-info">
                          <div className="profile-order-icon">
                            <Package size={28} color="white" />
                          </div>
                          <div>
                            <p className="profile-order-id">Sipariş #{order.id}</p>
                            <h4 className="profile-order-date">
                              {new Date(order.order_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </h4>
                          </div>
                        </div>
                        
                        <div className="profile-order-stats">
                          <div className="profile-order-stat">
                            <p className="profile-order-stat-label">Ürün Adedi</p>
                            <p className="profile-order-stat-value">{totalItems}</p>
                          </div>
                          <div className="profile-order-stat-divider"></div>
                          <div className="profile-order-stat">
                            <p className="profile-order-stat-label">Toplam Tutar</p>
                            <p className="profile-order-stat-value">{Number(order.total_price).toLocaleString()} TL</p>
                          </div>
                          <div className="profile-order-stat-divider"></div>
                          <div>
                            <span className={`profile-order-status ${getStatusClass(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </div>
                          <button 
                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                            className="profile-expand-btn"
                          >
                            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                          </button>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="profile-order-details">
                          {/* Ürünler */}
                          <div>
                            <p className="profile-details-title">
                              <ShoppingBag size={16} /> Sipariş Edilen Ürünler
                            </p>
                            <div>
                              {order.items?.map((item, idx) => (
                                <div key={idx} className="profile-product-item">
                                  <div className="profile-product-info">
                                    {item.image_url && (
                                      <img 
  src={getImageUrl(item.image_url)} 
  className="profile-product-image"
  alt={item.product_name}
/>
                                    )}
                                    <div>
                                      <p className="profile-product-name">{item.product_name}</p>
                                      <p className="profile-product-meta">{item.quantity} adet x {item.unit_price} TL</p>
                                    </div>
                                  </div>
                                  <p className="profile-product-total">{item.total || item.quantity * item.unit_price} TL</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Adres Bilgileri */}
                          <div className="profile-address-grid">
                            <div>
                              <p className="profile-details-title">
                                <MapPin size={16} /> Teslimat Adresi
                              </p>
                              <div className="profile-address-card">
                                <p className="profile-address-name">{order.full_name || 'İsimsiz'}</p>
                                <p className="profile-address-text">{order.shipping_address || 'Adres bilgisi girilmemiş'}</p>
                                <p className="profile-address-city">
                                  {order.city && order.district ? `${order.city} / ${order.district}` : ''}
                                  {order.zip_code && ` - ${order.zip_code}`}
                                </p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="profile-details-title">
                                <Truck size={16} /> Kargo & Ödeme Bilgileri
                              </p>
                              <div className="profile-address-card">
                                <div className="profile-info-row">
                                  <span>Kargo Yöntemi:</span>
                                  <span className="profile-info-value">{order.shipping_method || 'Standart'}</span>
                                </div>
                                <div className="profile-info-row">
                                  <span>Taksit Seçeneği:</span>
                                  <span className="profile-info-value">{order.installment || 1} Taksit</span>
                                </div>
                                {order.tracking_number && (
                                  <div className="profile-info-row">
                                    <span>Takip Numarası:</span>
                                    <span className="profile-tracking-no">{order.tracking_number}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Zaman Çizelgesi */}
                          <div>
                            <p className="profile-details-title">
                              <Clock size={16} /> Sipariş Zaman Çizelgesi
                            </p>
                            <div className="profile-timeline">
                              <div className="profile-timeline-item">
                                <div className="profile-timeline-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                                  <CheckCircle size={16} />
                                </div>
                                <p className="profile-timeline-label">Sipariş Alındı</p>
                                <p className="profile-timeline-date">{new Date(order.order_date).toLocaleDateString('tr-TR')}</p>
                              </div>
                              <div className="profile-timeline-line"></div>
                              <div className="profile-timeline-item">
                                <div className="profile-timeline-icon" style={{ 
                                  background: order.status === 'shipped' || order.status === 'delivered' ? '#dbeafe' : '#f1f5f9',
                                  color: order.status === 'shipped' || order.status === 'delivered' ? '#2563eb' : '#94a3b8'
                                }}>
                                  <Truck size={16} />
                                </div>
                                <p className="profile-timeline-label">Kargoya Verildi</p>
                                {order.shipped_date && <p className="profile-timeline-date">{new Date(order.shipped_date).toLocaleDateString('tr-TR')}</p>}
                              </div>
                              <div className="profile-timeline-line"></div>
                              <div className="profile-timeline-item">
                                <div className="profile-timeline-icon" style={{ 
                                  background: order.status === 'delivered' ? '#dcfce7' : '#f1f5f9',
                                  color: order.status === 'delivered' ? '#16a34a' : '#94a3b8'
                                }}>
                                  <CheckCircle size={16} />
                                </div>
                                <p className="profile-timeline-label">Teslim Edildi</p>
                                {order.delivered_date && <p className="profile-timeline-date">{new Date(order.delivered_date).toLocaleDateString('tr-TR')}</p>}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: FAVORİLER */}
          {activeTab === 'favorites' && (
            <div>
              <h3 className="profile-section-title">
                <Heart size={24} color="#ec4899" fill="#ec4899" />
                Favorilerim
              </h3>
              
              {favorites.length === 0 ? (
                <div className="profile-empty-state">
                  <Heart size={80} color="#e2e8f0" />
                  <p className="profile-empty-text">Favori ürünün bulunmuyor.</p>
                </div>
              ) : (
                <div className="profile-fav-grid">
                  {favorites.map((fav) => (
                    <div key={fav.id} className="profile-fav-card" onClick={() => navigate(`/product/${fav.id}`)}>
                      <div className="profile-fav-image">
<img src={getImageUrl(fav.image_url)} alt={fav.name} />
                      </div>
                      <div className="profile-fav-info">
                        <h4 className="profile-fav-name">{fav.name}</h4>
                        <p className="profile-fav-price">{fav.price} TL</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFavorite(fav.id);
                        }} 
                        className="profile-fav-delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;