import { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, Plus, Trash2, Edit3, 
  TrendingUp, ArrowLeftRight, X, Clock, Save, Image, Percent, Truck, Sparkles, 
  ChevronDown, Search, Filter, SlidersHorizontal, Tags
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatPrice, formatDiscountedPrice, cleanPrice, getImageUrl, getRawPrice } from '../utils/formatPrice';
import '../styles/AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ 
    totalSales: 0, 
    orderCount: 0, 
    userCount: 0,
    activeCustomers: 0,
    avgOrderValue: 0,
    monthlyGrowth: 0,
    todayRevenue: 0,
    todayOrders: 0,
    revenueChange: 0,
    orderChange: 0,
    weeklyTotal: 0,
    weeklyOrders: 0,
    monthlyTotal: 0,
    monthlyOrders: 0,
    topProducts: [],
    categorySales: [],
    todayTopProducts: []
  });
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedProductForImages, setSelectedProductForImages] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [trackingForm, setTrackingForm] = useState({
    trackingNumber: '',
    shippingCompany: '',
    notes: ''
  });
  
  // Kategori Yönetimi - BACKEND'DEN GELEN
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '📦', active: true });
  const [categorySearch, setCategorySearch] = useState('');
  
  // Filtreleme State'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [stockFilter, setStockFilter] = useState('all');

  const sortOptions = [
    { value: 'default', label: 'Varsayılan (ID)' },
    { value: 'name_asc', label: 'Ürün Adı (A-Z)' },
    { value: 'name_desc', label: 'Ürün Adı (Z-A)' },
    { value: 'price_asc', label: 'Fiyat (En Düşük)' },
    { value: 'price_desc', label: 'Fiyat (En Yüksek)' },
    { value: 'stock_asc', label: 'Stok (En Az)' },
    { value: 'stock_desc', label: 'Stok (En Çok)' },
    { value: 'newest', label: 'En Yeni' },
    { value: 'oldest', label: 'En Eski' }
  ];

  const [productForm, setProductForm] = useState({
    id: null, 
    name: '', 
    category: '', 
    price: '', 
    description: '', 
    details: '',
    stock_quantity: '',
    discount: 0,
    is_new: false,
    free_shipping: false,
    image: null
  });

  const navigate = useNavigate();

  // Filtrelenmiş kategoriler
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // ========== KATEGORİ CRUD FONKSİYONLARI (Backend ile senkronize) ==========
  
  // Kategorileri backend'den çek
  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error("Kategoriler yüklenemedi:", err);
      toast.error("Kategoriler yüklenemedi!");
    }
  };

  // Yeni kategori ekle (backend'e ve state'e)
  const handleCategorySubmit = async () => {
    if (!categoryForm.name.trim()) {
      toast.error('Kategori adı gerekli');
      return;
    }
    
    try {
      if (editingCategory) {
        // Güncelleme
        await api.put(`/admin/categories/${editingCategory.id}`, {
          name: categoryForm.name,
          icon: categoryForm.icon,
          active: categoryForm.active
        });
        toast.success('Kategori güncellendi');
      } else {
        // Yeni ekleme
        const res = await api.post('/admin/categories', {
          name: categoryForm.name,
          icon: categoryForm.icon,
          active: categoryForm.active
        });
        toast.success('Yeni kategori eklendi');
      }
      
      // Kategorileri yeniden çek (state güncellenir)
      await fetchCategories();
      
      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', icon: '📦', active: true });
    } catch (err) {
      toast.error("İşlem başarısız: " + (err.response?.data?.error || "Hata oluştu"));
    }
  };

  // Kategori sil
  const deleteCategory = async (id) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinize emin misiniz? Ürünler etkilenmez.')) return;
    
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.info('Kategori silindi');
      await fetchCategories(); // Kategorileri yeniden çek
    } catch (err) {
      toast.error("Silme başarısız: " + (err.response?.data?.error || "Hata oluştu"));
    }
  };

  // Kategori düzenleme modalını aç
  const openCategoryEditModal = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      icon: category.icon || '📦',
      active: category.active === 1 || category.active === true
    });
    setShowCategoryModal(true);
  };

  // ========== DİĞER FONKSİYONLAR ==========

  useEffect(() => {
    fetchAdminData();
    fetchCategories(); // Kategorileri backend'den çek
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortBy, priceRange, stockFilter]);

  const calculateDiscountedPrice = (price, discount) => {
    if (!price || !discount || discount === 0) return price;
    return (price - (price * discount / 100)).toFixed(2);
  };

  const fetchAdminData = async () => {
    try {
      const prodRes = await api.get('/products');
      setProducts(prodRes.data);
      setFilteredProducts(prodRes.data);
      
      const statsRes = await api.get('/admin/dashboard-stats');
      if (statsRes.data) {
        setStats({
          totalSales: statsRes.data.summary.totalSales,
          orderCount: statsRes.data.summary.orderCount,
          userCount: statsRes.data.summary.userCount,
          activeCustomers: statsRes.data.summary.activeCustomers,
          avgOrderValue: statsRes.data.summary.avgOrderValue,
          todayRevenue: statsRes.data.today?.revenue,
          todayOrders: statsRes.data.today?.orders,
          revenueChange: statsRes.data.today?.revenueChange,
          orderChange: statsRes.data.today?.orderChange,
          weeklyTotal: statsRes.data.weekly?.total,
          weeklyOrders: statsRes.data.weekly?.orders,
          monthlyTotal: statsRes.data.monthly?.total,
          monthlyOrders: statsRes.data.monthly?.orders,
          topProducts: statsRes.data.topProducts,
          categorySales: statsRes.data.categorySales,
          todayTopProducts: statsRes.data.todayTopProducts
        });
      }
      
      const ordersRes = await api.get('/admin/orders');
      setOrders(ordersRes.data);
      
    } catch (err) { 
      console.error("Veri hatası:", err); 
      setOrders([]);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (priceRange.min) {
      filtered = filtered.filter(product => product.price >= Number(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(product => product.price <= Number(priceRange.max));
    }

    switch(stockFilter) {
      case 'critical':
        filtered = filtered.filter(product => product.stock_quantity <= 5);
        break;
      case 'low':
        filtered = filtered.filter(product => product.stock_quantity > 0 && product.stock_quantity <= 10);
        break;
      case 'inStock':
        filtered = filtered.filter(product => product.stock_quantity > 0);
        break;
      case 'outStock':
        filtered = filtered.filter(product => product.stock_quantity === 0);
        break;
      default:
        break;
    }

    switch(sortBy) {
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name, 'tr'));
        break;
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'stock_asc':
        filtered.sort((a, b) => a.stock_quantity - b.stock_quantity);
        break;
      case 'stock_desc':
        filtered.sort((a, b) => b.stock_quantity - a.stock_quantity);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      default:
        filtered.sort((a, b) => b.id - a.id);
        break;
    }

    setFilteredProducts(filtered);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('default');
    setPriceRange({ min: '', max: '' });
    setStockFilter('all');
    setShowFilters(false);
  };

  const handleDetailImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setImageUploadLoading(true);
      const res = await api.post('/admin/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const imageUrl = getImageUrl(res.data.image_url);
      
      setProductForm(prev => ({
        ...prev,
        details: prev.details + (prev.details ? '\n' : '') + `<img src="${imageUrl}" alt="detay-resim" style="max-width:100%; margin:15px 0; border-radius:12px;" />`
      }));
    } catch (err) {
      toast.error("Resim yüklenemedi!");
    } finally {
      setImageUploadLoading(false);
      e.target.value = '';
    }
  };

  const fetchProductImages = async (productId) => {
    try {
      const res = await api.get(`/products/${productId}`);
      setProductImages(res.data.images || []);
    } catch (err) {
      console.error("Resimler yüklenemedi", err);
    }
  };

  const openOrderDetail = (order) => {
    setSelectedOrder(order);
    setTrackingForm({
      trackingNumber: order.tracking_number || '',
      shippingCompany: order.shipping_company || '',
      notes: ''
    });
    setShowOrderDetail(true);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const payload = {
        orderId,
        status: newStatus,
        trackingNumber: trackingForm.trackingNumber,
        shippingCompany: trackingForm.shippingCompany,
        notes: trackingForm.notes
      };
      await api.put('/admin/update-status', payload);
      toast.success('✅ Sipariş durumu güncellendi!');
      setShowOrderDetail(false);
      fetchAdminData();
    } catch (err) {
      toast.error("Güncelleme başarısız: " + (err.response?.data?.error || "Hata oluştu"));
    }
  };

  const openEditModal = (product) => {
    setEditMode(true);
    const cleanPriceValue = getRawPrice(product.price);

    setProductForm({ 
      id: product.id,
      name: product.name || '', 
      category: product.category || '', 
      price: cleanPriceValue,
      description: product.description || '', 
      details: product.details || '',
      stock_quantity: product.stock_quantity || '',
      discount: product.discount || 0,
      is_new: product.is_new === 1 || product.is_new === true,
      free_shipping: product.free_shipping === 1 || product.free_shipping === true,
      image: null 
    });
    setShowModal(true);
  };

  const openImageModal = (product) => {
    setSelectedProductForImages(product);
    fetchProductImages(product.id);
    setShowImageModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    
    if (productForm.name) formData.append('name', productForm.name);
    if (productForm.category) formData.append('category', productForm.category);
    
    let finalPrice = productForm.price;
    if (finalPrice) {
      if (typeof finalPrice === 'string') {
        finalPrice = finalPrice.replace(/[^0-9]/g, '');
      }
      formData.append('price', finalPrice);
    }
    
    if (productForm.description) formData.append('description', productForm.description);
    if (productForm.details) formData.append('details', productForm.details);
    if (productForm.stock_quantity) formData.append('stock_quantity', productForm.stock_quantity);
    if (productForm.discount) formData.append('discount', productForm.discount);
    
    formData.append('is_new', productForm.is_new ? 'true' : 'false');
    formData.append('free_shipping', productForm.free_shipping ? 'true' : 'false');
    
    if (productForm.image) {
      formData.append('image', productForm.image);
    }
    
    try {
      if (editMode) {
        await api.put(`/admin/update-product/${productForm.id}`, formData);
        toast.success('✅ Ürün başarıyla güncellendi!');
      } else {
        await api.post('/admin/add-product', formData);
        toast.success('🎉 Yeni ürün başarıyla eklendi!');
      }
      setShowModal(false);
      fetchAdminData();
    } catch (err) { 
      const errorMsg = err.response?.data?.error || "İşlem başarısız!";
      toast.error(errorMsg);
      console.error("Hata:", err.response?.data);
    }
    setLoading(false);
  };
const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    // İLK RESİMSE veya Ana Görsel olarak seçildiyse is_main = true
    const isFirstImage = productImages.length === 0;
    formData.append('is_main', isFirstImage ? 'true' : 'false');
    formData.append('display_order', String(productImages.length));

    try {
        setImageUploadLoading(true);
        await api.post(`/admin/add-product-image/${selectedProductForImages.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('🖼️ Resim başarıyla eklendi!');
        fetchProductImages(selectedProductForImages.id);
        fetchAdminData(); // Ürün listesini yenile
    } catch (err) {
        console.error("Yükleme Hatası Detayı:", err.response?.data);
        toast.error(err.response?.data?.error || "Resim yüklenemedi");
    } finally {
        setImageUploadLoading(false);
        e.target.value = '';
    }
};

  const deleteProductImage = async (imageId) => {
    if (!window.confirm("Bu resmi silmek istediğinize emin misiniz?")) return;
    
    try {
      await api.delete(`/admin/delete-product-image/${imageId}`);
      toast.success("Resim silindi!");
      fetchProductImages(selectedProductForImages.id);
    } catch (err) {
      toast.error("Resim silinemedi.");
    }
  };

  const deleteProduct = async (id) => {
    if(window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
      try {
        await api.delete(`/admin/delete-product/${id}`);
        fetchAdminData();
      } catch (err) { toast.error("Silme işlemi başarısız."); }
    }
  };

  const getStockBadgeClass = (stock) => {
    if (stock <= 5) return 'stock-critical';
    if (stock <= 10) return 'stock-low';
    return 'stock-normal';
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'delivered': return 'status-delivered';
      case 'shipped': return 'status-shipped';
      case 'processing': return 'status-processing';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'delivered': return '✅ Teslim Edildi';
      case 'shipped': return '🚚 Kargoda';
      case 'processing': return '⚙️ Hazırlanıyor';
      case 'pending': return '⏳ Bekliyor';
      case 'cancelled': return '❌ İptal';
      default: return '⏳ Bekliyor';
    }
  };

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-icon">
            <LayoutDashboard size={28} />
          </div>
          <h1 className="admin-logo-text">MCG<span className="admin-logo-highlight">ADMIN</span></h1>
        </div>
        
        <nav className="admin-menu">
          <button onClick={() => setActiveTab('dashboard')} className={`admin-menu-item ${activeTab === 'dashboard' ? 'admin-menu-item-active' : ''}`}>
            <TrendingUp className="admin-menu-icon" />
            <span>Dashboard</span>
          </button>
          <button onClick={() => setActiveTab('products')} className={`admin-menu-item ${activeTab === 'products' ? 'admin-menu-item-active' : ''}`}>
            <Package className="admin-menu-icon" />
            <span>Ürün Yönetimi</span>
          </button>
          <button onClick={() => setActiveTab('orders')} className={`admin-menu-item ${activeTab === 'orders' ? 'admin-menu-item-active' : ''}`}>
            <ShoppingCart className="admin-menu-icon" />
            <span>Siparişler</span>
          </button>
          <button onClick={() => setActiveTab('categories')} className={`admin-menu-item ${activeTab === 'categories' ? 'admin-menu-item-active' : ''}`}>
            <Tags className="admin-menu-icon" />
            <span>Kategoriler</span>
          </button>
        </nav>
        
        <button onClick={() => navigate('/')} className="admin-sidebar-footer">
          <ArrowLeftRight size={20} />
          <span>Mağazaya Dön</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        
        {/* DASHBOARD TAB - Aynı */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="admin-header">
              <h2 className="admin-header-title">Genel Durum 👋</h2>
              <p className="admin-header-subtitle">Mağazanın bugünkü performans verileri.</p>
            </div>
            
            <div className="admin-stats-grid">
              <div className="stat-card">
                <div className="stat-card-info">
                  <p className="stat-card-label">Toplam Kazanç</p>
                  <h4 className="stat-card-value">{Number(stats.totalSales || 0).toLocaleString()} TL</h4>
                  <p className={`stat-card-trend ${Number(stats.monthlyGrowth || 0) >= 0 ? 'positive' : 'negative'}`}>
                    {Number(stats.monthlyGrowth || 0) >= 0 ? '+' : ''}{stats.monthlyGrowth || 0}% bu ay
                  </p>
                </div>
                <div className="stat-card-icon icon-emerald">
                  <TrendingUp size={32} />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-card-info">
                  <p className="stat-card-label">Toplam Sipariş</p>
                  <h4 className="stat-card-value">{Number(stats.orderCount || 0).toLocaleString()}</h4>
                  <p className="stat-card-trend positive">+{stats.monthlyOrderGrowth || 0} bu ay</p>
                </div>
                <div className="stat-card-icon icon-amber">
                  <ShoppingCart size={32} />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-card-info">
                  <p className="stat-card-label">Toplam Müşteri</p>
                  <h4 className="stat-card-value">{Number(stats.userCount || 0).toLocaleString()}</h4>
                  <p className="stat-card-trend">{Number(stats.activeCustomers || 0)} aktif</p>
                </div>
                <div className="stat-card-icon icon-indigo">
                  <Users size={32} />
                </div>
              </div>
            </div>

            <div className="daily-stats-grid">
              <div className="daily-card">
                <div className="daily-header">
                  <span className="daily-label">Bugünkü Satış</span>
                  <span className="daily-date">{new Date().toLocaleDateString('tr-TR')}</span>
                </div>
                <div className="daily-value">{Number(stats.todayRevenue || 0).toLocaleString()} TL</div>
                <div className="daily-compare">
                  <span className={`daily-change ${Number(stats.revenueChange || 0) >= 0 ? 'positive' : 'negative'}`}>
                    {Number(stats.revenueChange || 0) >= 0 ? '↑' : '↓'} {Math.abs(Number(stats.revenueChange || 0))}% 
                  </span>
                  <span className="daily-compare-text">düne göre</span>
                </div>
                <div className="daily-orders">
                  <span className="orders-count">{Number(stats.todayOrders || 0)} sipariş</span>
                  <span className={`orders-change ${Number(stats.orderChange || 0) >= 0 ? 'positive' : 'negative'}`}>
                    {Number(stats.orderChange || 0) >= 0 ? '↑' : '↓'} {Math.abs(Number(stats.orderChange || 0))}%
                  </span>
                </div>
              </div>

              <div className="daily-card">
                <div className="daily-header">
                  <span className="daily-label">Haftalık Satış</span>
                  <span className="daily-date">Son 7 gün</span>
                </div>
                <div className="daily-value">{Number(stats.weeklyTotal || 0).toLocaleString()} TL</div>
                <div className="daily-orders">
                  <span className="orders-count">{Number(stats.weeklyOrders || 0)} sipariş</span>
                </div>
                <div className="daily-avg">
                  Ortalama: {Number((stats.weeklyTotal / 7) || 0).toLocaleString()} TL/gün
                </div>
              </div>

              <div className="daily-card">
                <div className="daily-header">
                  <span className="daily-label">Aylık Satış</span>
                  <span className="daily-date">Son 30 gün</span>
                </div>
                <div className="daily-value">{Number(stats.monthlyTotal || 0).toLocaleString()} TL</div>
                <div className="daily-orders">
                  <span className="orders-count">{Number(stats.monthlyOrders || 0)} sipariş</span>
                </div>
                <div className="daily-avg">
                  Ortalama Sipariş: {Number(stats.avgOrderValue || 0).toLocaleString()} TL
                </div>
              </div>
            </div>

            {stats.todayTopProducts && stats.todayTopProducts.length > 0 && (
              <div className="top-products-section">
                <h3 className="section-subtitle">⭐ Bugünün En Çok Satan Ürünleri</h3>
                <div className="top-products-list">
                  {stats.todayTopProducts.map((product, idx) => (
                    <div key={product.id} className="top-product-item">
                      <div className="top-product-rank">{idx + 1}</div>
                      <div className="top-product-info">
                        <div className="top-product-name">{product.name}</div>
                        <div className="top-product-stats">
                          <span className="top-product-sold">{product.today_sold} adet satıldı</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats.topProducts && stats.topProducts.length > 0 && (
              <div className="top-products-section">
                <h3 className="section-subtitle">🏆 En Çok Satan Ürünler</h3>
                <div className="top-products-grid">
                  {stats.topProducts.map((product, idx) => (
                    <div key={product.id} className="top-product-card">
                      <div className="top-rank">#{idx + 1}</div>
                      {product.image_url && (
                        <img 
                          src={getImageUrl(product.image_url)} 
                          alt={product.name}
                          className="top-product-img"
                        />
                      )}
                      <div className="top-product-details">
                        <div className="top-product-name">{product.name}</div>
                        <div className="top-product-price">{Number(product.price).toLocaleString()} TL</div>
                        <div className="top-product-sold">Toplam {product.total_sold} adet</div>
                        <div className="top-product-revenue">{Number(product.total_revenue).toLocaleString()} TL</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats.categorySales && stats.categorySales.length > 0 && (
              <div className="category-stats-section">
                <h3 className="section-subtitle">📊 Kategori Bazında Satış</h3>
                <div className="category-stats-grid">
                  {stats.categorySales.map((category, idx) => (
                    <div key={idx} className="category-stat-card">
                      <div className="category-name">{category.category}</div>
                      <div className="category-revenue">{Number(category.total_revenue).toLocaleString()} TL</div>
                      <div className="category-details">
                        <span>{category.total_sold} adet</span>
                        <span>{category.order_count} sipariş</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div>
            <div className="products-header">
              <div>
                <h2 className="products-title">Ürün Portföyü</h2>
                <p className="products-count">
                  {filteredProducts.length} / {products.length} ürün listeleniyor
                </p>
              </div>
              <div className="products-header-actions">
                <button onClick={() => { setShowFilters(!showFilters); }} className="btn-filter-toggle">
                  <SlidersHorizontal size={18} />
                  Filtrele
                </button>
                <button onClick={() => { setEditMode(false); setProductForm({ name: '', category: '', price: '', description: '', details: '', stock_quantity: '', discount: 0, is_new: false, free_shipping: false, image: null }); setShowModal(true); }} className="btn-add-product">
                  <Plus size={24} /> Yeni Ürün Ekle
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="filters-panel-admin">
                <div className="filters-row">
                  <div className="filter-group">
                    <label>🔍 Ürün Ara</label>
                    <div className="search-input-wrapper">
                      <Search size={18} className="search-icon" />
                      <input 
                        type="text" 
                        placeholder="Ürün adı, kategori veya açıklama..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                      />
                      {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="clear-search">
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="filter-group">
                    <label>📁 Kategori</label>
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                      <option value="all">📁 Tüm Kategoriler</option>
                      {categories.filter(c => c.active).map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>🔄 Sırala</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      {sortOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="filters-row">
                  <div className="filter-group price-range-group">
                    <label>💰 Fiyat Aralığı (TL)</label>
                    <div className="price-range-inputs">
                      <input 
                        type="number" 
                        placeholder="Min" 
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      />
                      <span>-</span>
                      <input 
                        type="number" 
                        placeholder="Max" 
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="filter-group">
                    <label>📦 Stok Durumu</label>
                    <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
                      <option value="all">Tümü</option>
                      <option value="critical">Kritik Stok (≤5)</option>
                      <option value="low">Stok Azalıyor (≤10)</option>
                      <option value="inStock">Stokta Var</option>
                      <option value="outStock">Stokta Yok</option>
                    </select>
                  </div>

                  <div className="filter-group reset-group">
                    <label>&nbsp;</label>
                    <button onClick={resetFilters} className="btn-reset-filters">
                      Filtreleri Sıfırla
                    </button>
                  </div>
                </div>
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="no-products-admin">
                <Package size={64} />
                <h3>Ürün Bulunamadı</h3>
                <p>Arama kriterlerinize uygun ürün bulunmamaktadır.</p>
                <button onClick={resetFilters} className="btn-reset">Filtreleri Temizle</button>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map(product => {
                  const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
                  const hasDiscount = product.discount > 0;
                  const isNew = product.is_new === 1 || product.is_new === true;
                  const hasFreeShipping = product.free_shipping === 1 || product.free_shipping === true;
                  
                  return (
                    <div key={product.id} className="product-card">
                      <img 
                        src={getImageUrl(product.image_url)} 
                        className="product-image" 
                        alt={product.name} 
                      />
                      <div className="product-details">
                        <div>
                          <div className="product-header">
                            <span className="product-category">{product.category}</span>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                              {hasDiscount && <span className="product-discount-badge-small">-%{product.discount}</span>}
                              {hasFreeShipping && <span className="product-free-shipping-badge-small">🚚 Kargo Bedava</span>}
                              {isNew && <span className="product-new-badge-small">✨ Yeni</span>}
                              <span className={`product-stock-badge ${getStockBadgeClass(product.stock_quantity)}`}>
                                {product.stock_quantity <= 5 ? `KRİTİK STOK: ${product.stock_quantity}` : 
                                 product.stock_quantity <= 10 ? `STOK AZALIYOR: ${product.stock_quantity}` : 
                                 `Stok: ${product.stock_quantity}`}
                              </span>
                            </div>
                          </div>
                          <h3 className="product-name">{product.name}</h3>
                          <div className="product-price-row">
                            {hasDiscount ? (
                              <>
                                <span className="product-price-original-small">{product.price} TL</span>
                                <span className="product-price-discount-small">{Math.floor(discountedPrice)} TL</span>
                              </>
                            ) : (
                              <span className="product-price-current-small">{product.price} TL</span>
                            )}
                          </div>
                        </div>
                        <div className="product-actions">
                          <button onClick={() => openImageModal(product)} className="btn-images">
                            <Image size={16} /> Resimler ({product.image_count || 0})
                          </button>
                          <button onClick={() => openEditModal(product)} className="btn-edit">
                            <Edit3 size={16} /> Düzenle
                          </button>
                          <button onClick={() => deleteProduct(product.id)} className="btn-delete">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div>
            <div className="orders-header">
              <div>
                <h2 className="orders-title">📦 Sipariş Takibi</h2>
                <p className="orders-count">Toplam {orders.length} sipariş listeleniyor.</p>
              </div>
              <button onClick={() => fetchAdminData()} className="btn-refresh">
                <Clock size={18} /> Yenile
              </button>
            </div>
            
            <div className="orders-table-container">
              {orders.length === 0 ? (
                <div className="empty-state">
                  <ShoppingCart size={64} className="empty-state-icon" />
                  <p className="empty-state-title">Henüz bir sipariş kaydı bulunmuyor.</p>
                  <p className="empty-state-subtitle">Müşteriler alışveriş yaptığında siparişler burada görünecek.</p>
                </div>
              ) : (
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Sipariş ID</th>
                      <th>Müşteri</th>
                      <th>Ürün Adedi</th>
                      <th>Toplam Tutar</th>
                      <th>Durum</th>
                      <th>Sipariş Tarihi</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td><span className="order-id">#{order.id}</span></td>
                        <td>
                          <p className="order-customer-name">{order.full_name || 'İsimsiz Kullanıcı'}</p>
                          <p className="order-customer-email">{order.email || '-'}</p>
                        </td>
                        <td>
                          <div className="order-items">
                            <Package className="order-items-icon" size={14} />
                            <span className="order-items-count">{order.total_items || order.items?.length || 0} ürün</span>
                          </div>
                        </td>
                        <td><span className="order-total">{Number(order.total_price).toLocaleString()} TL</span></td>
                        <td>
                          <span className={`order-status-badge ${getStatusClass(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td>
                          <div className="order-date">
                            {new Date(order.order_date).toLocaleDateString('tr-TR')}
                          </div>
                        </td>
                        <td>
                          <button onClick={() => openOrderDetail(order)} className="btn-detail">
                            <Package size={12} /> Detay
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div>
            <div className="products-header">
              <div>
                <h2 className="products-title">📁 Kategori Yönetimi</h2>
                <p className="products-count">
                  Toplam {filteredCategories.length} kategori
                </p>
              </div>
              <div className="products-header-actions">
                <button 
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm({ name: '', icon: '📦', active: true });
                    setShowCategoryModal(true);
                  }} 
                  className="btn-add-product"
                >
                  <Plus size={20} /> Yeni Kategori
                </button>
              </div>
            </div>

            {/* Arama Kutusu */}
            <div className="filters-panel-admin" style={{ marginBottom: '24px' }}>
              <div className="filter-group">
                <label>🔍 Kategori Ara</label>
                <div className="search-input-wrapper">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Kategori adı ile ara..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="search-input"
                  />
                  {categorySearch && (
                    <button onClick={() => setCategorySearch('')} className="clear-search">
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Kategoriler Tablosu */}
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>İkon</th>
                    <th>Kategori Adı</th>
                    <th>Durum</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '48px' }}>
                        <Package size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                        <p>Kategori bulunamadı</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map(cat => (
                      <tr key={cat.id}>
                        <td className="order-id">#{cat.id}</td>
                        <td style={{ fontSize: '28px' }}>{cat.icon || '📦'}</td>
                        <td style={{ fontWeight: 'bold', color: 'white' }}>{cat.name}</td>
                        <td>
                          <span className={`order-status-badge ${cat.active ? 'status-delivered' : 'status-cancelled'}`}>
                            {cat.active ? '✅ Aktif' : '⛔ Pasif'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => openCategoryEditModal(cat)} className="btn-edit" style={{ padding: '8px 16px' }}>
                              <Edit3 size={14} /> Düzenle
                            </button>
                            <button onClick={() => deleteCategory(cat.id)} className="btn-delete" style={{ padding: '8px 16px' }}>
                              <Trash2 size={14} /> Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '24px', background: 'rgba(245,158,11,0.1)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(245,158,11,0.3)' }}>
              <p style={{ fontSize: '13px', color: '#fbbf24' }}>
                💡 <strong>Not:</strong> Kategorileri düzenlediğinizde, ana mağazadaki kategori listesi otomatik güncellenir.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ÜRÜN EKLE/DÜZENLE MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2 className="modal-title">{editMode ? 'Ürünü Güncelle' : 'Yeni Ürün Kaydı'}</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <X size={28} />
              </button>
            </div>
            
            <form onSubmit={handleProductSubmit} className="modal-form">
              <div className="modal-form-field">
                <label className="modal-label">📦 Ürün Adı</label>
                <input className="modal-input" placeholder="Örn: iPhone 15 Pro" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required />
              </div>
              
              <div className="modal-form-row">
                <div className="modal-form-field">
                  <label className="modal-label">💰 Fiyat (TL)</label>
                  <input 
                    className="modal-input" 
                    placeholder="Örn: 47" 
                    type="text" 
                    inputMode="numeric"
                    value={productForm.price} 
                    onChange={e => {
                      const rawValue = e.target.value.replace(/[^0-9]/g, '');
                      setProductForm({...productForm, price: rawValue});
                    }} 
                    required 
                  />
                  <small style={{ color: '#64748b', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                    Sadece rakam girin. Örnek: 47 (ön yüzde 47,00 TL olarak görünür)
                  </small>
                </div>
                <div className="modal-form-field">
                  <label className="modal-label">📊 Stok Miktarı</label>
                  <input 
                    className="modal-input" 
                    placeholder="Örn: 50" 
                    type="number" 
                    value={productForm.stock_quantity} 
                    onChange={e => setProductForm({...productForm, stock_quantity: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div className="modal-form-row">
                <div className="modal-form-field">
                  <label className="modal-label">🏷️ İndirim (%)</label>
                  <input className="modal-input" placeholder="Örn: 20" type="number" value={productForm.discount} onChange={e => setProductForm({...productForm, discount: e.target.value})} />
                  {productForm.discount > 0 && productForm.price && (
                    <div className="discount-preview">
                      <span>İndirimli Fiyat: </span>
                      <strong>{formatDiscountedPrice(parseFloat(productForm.price), productForm.discount)} TL</strong>
                    </div>
                  )}
                </div>
                <div className="modal-form-field">
                  <label className="modal-label">📁 Kategori</label>
                  <select className="modal-input" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} required>
                    <option value="" disabled>Kategori Seçiniz</option>
                    {categories.filter(c => c.active).map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-checkbox-row">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={productForm.is_new} 
                    onChange={e => setProductForm({...productForm, is_new: e.target.checked})} 
                  />
                  <Sparkles size={16} />
                  ✨ Yeni Ürün
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={productForm.free_shipping} 
                    onChange={e => setProductForm({...productForm, free_shipping: e.target.checked})} 
                  />
                  <Truck size={16} />
                  🚚 Kargo Bedava
                </label>
              </div>
              
              <div className="modal-form-field" style={{ gridColumn: 'span 2' }}>
                <label className="modal-label">📝 Kısa Açıklama (Sadece Yazı)</label>
                <textarea className="modal-textarea" placeholder="Ürünün kısa özetini yazın..." value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} rows="3" />
              </div>

              <div className="modal-form-field" style={{ gridColumn: 'span 2' }}>
                <label className="modal-label">🖼️ Ürün Detayları (Resim + Yazı)</label>
                <div className="detail-toolbar">
                  <input type="file" id="detail-img-input" hidden onChange={handleDetailImageUpload} accept="image/*" />
                  <button type="button" className="add-img-btn" onClick={() => document.getElementById('detail-img-input').click()} disabled={imageUploadLoading}>
                    {imageUploadLoading ? 'Yükleniyor...' : <><Image size={16} /> Görsel Yükle</>}
                  </button>
                  <button type="button" className="add-img-btn" onClick={() => {
                    const url = prompt('Resim URL\'sini girin:');
                    if (url) {
                      setProductForm({
                        ...productForm,
                        details: productForm.details + `<img src="${url}" alt="detay-resim" style="max-width:100%; margin:15px 0; border-radius:12px;" />\n`
                      });
                    }
                  }}>
                    URL'den Resim Ekle
                  </button>
                </div>
                <textarea className="modal-textarea detail-area" placeholder="Ürün detaylarını buraya yazın. HTML etiketleri kullanabilirsiniz.\n\nÖrnek:\n<h3>Özellikler</h3>\n<ul>\n  <li>Özellik 1</li>\n  <li>Özellik 2</li>\n</ul>" value={productForm.details} onChange={e => setProductForm({...productForm, details: e.target.value})} rows="10" />
                <div className="description-preview">
                  <small>💡 İpucu: &lt;h3&gt;Başlık&lt;/h3&gt;, &lt;ul&gt;&lt;li&gt;madde&lt;/li&gt;&lt;/ul&gt;, &lt;img src='url'&gt; kullanabilirsiniz.</small>
                </div>
              </div>
              
              <div className="modal-form-field">
                <label className="modal-label">🖼️ Ana Görsel</label>
                <div className="file-upload">
                  <input type="file" id="file-up" style={{display: 'none'}} onChange={e => setProductForm({...productForm, image: e.target.files[0]})} />
                  <label htmlFor="file-up" className="file-upload-label">
                    {productForm.image ? productForm.image.name : (editMode ? 'Yeni görsel seçin (opsiyonel)' : 'Ana Görsel Seçiniz')}
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="modal-btn-cancel">İptal</button>
                <button type="submit" className="modal-btn-submit">
                  {loading ? 'İşleniyor...' : editMode ? <><Save size={20} /> Değişiklikleri Kaydet</> : <><Plus size={20} /> Ürünü Yayınla</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESİM YÖNETİM MODAL */}
      {showImageModal && selectedProductForImages && (
        <div className="modal-overlay">
          <div className="modal-content image-modal">
            <div className="modal-header">
              <h2 className="modal-title">📸 {selectedProductForImages.name} - Resimler</h2>
              <button onClick={() => setShowImageModal(false)} className="modal-close"><X size={28} /></button>
            </div>
            
            <div className="image-upload-section">
              <div className="file-upload image-upload">
                <input type="file" id="image-upload" accept="image/*" style={{display: 'none'}} onChange={handleImageUpload} />
                <label htmlFor="image-upload" className="file-upload-label">
                  {imageUploadLoading ? 'Yükleniyor...' : '+ Yeni Resim Ekle'}
                </label>
              </div>
            </div>

            <div className="images-grid">
              {productImages.length === 0 ? (
                <p className="no-images-text">Henüz resim eklenmemiş.</p>
              ) : (
                productImages.map((img, idx) => (
                  <div key={img.id} className="image-item">
                    <img src={getImageUrl(img.image_url)} alt={`Resim ${idx + 1}`} />
                    {img.is_main && <span className="main-badge">Ana Resim</span>}
                    <button onClick={() => deleteProductImage(img.id)} className="image-delete-btn"><Trash2 size={16} /></button>
                  </div>
                ))
              )}
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowImageModal(false)} className="modal-btn-submit">Kapat</button>
            </div>
          </div>
        </div>
      )}

      {/* KATEGORİ EKLE/DÜZENLE MODAL */}
      {showCategoryModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingCategory ? '📝 Kategori Düzenle' : '➕ Yeni Kategori Ekle'}
              </h2>
              <button onClick={() => setShowCategoryModal(false)} className="modal-close">
                <X size={28} />
              </button>
            </div>

            <div className="modal-form">
              <div className="modal-form-field">
                <label className="modal-label">🏷️ Kategori Adı</label>
                <input
                  className="modal-input"
                  placeholder="Örn: Parfüm"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                />
              </div>

              <div className="modal-form-field">
                <label className="modal-label">😀 Emoji / İkon</label>
                <input
                  className="modal-input"
                  placeholder="Örn: 👗"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  maxLength={2}
                />
                <small style={{ color: '#94a3b8', fontSize: '11px' }}>
                  Bir emoji kullanın (örn: 👗, 👔, 📱)
                </small>
              </div>

              <div className="modal-checkbox-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={categoryForm.active}
                    onChange={(e) => setCategoryForm({ ...categoryForm, active: e.target.checked })}
                  />
                  ✅ Kategori aktif (mağazada görünsün)
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="modal-btn-cancel">
                  İptal
                </button>
                <button type="button" onClick={handleCategorySubmit} className="modal-btn-submit">
                  <Save size={18} />
                  {editingCategory ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SİPARİŞ DETAY MODAL */}
      {showOrderDetail && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content order-detail-modal">
            <div className="modal-header">
              <h2 className="modal-title">Sipariş Detayı #{selectedOrder.id}</h2>
              <button onClick={() => setShowOrderDetail(false)} className="modal-close"><X size={28} /></button>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>👤 Müşteri Bilgileri</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><p style={{ color: 'rgba(255,255,255,0.4)' }}>Ad Soyad</p><p style={{ fontWeight: 'bold' }}>{selectedOrder.full_name || '-'}</p></div>
                <div><p style={{ color: 'rgba(255,255,255,0.4)' }}>E-posta</p><p style={{ fontWeight: 'bold' }}>{selectedOrder.email || '-'}</p></div>
                <div><p style={{ color: 'rgba(255,255,255,0.4)' }}>Telefon</p><p style={{ fontWeight: 'bold' }}>{selectedOrder.phone_number || '-'}</p></div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>📍 Teslimat Adresi</h3>
              <div><p>{selectedOrder.shipping_address || '-'}</p><p style={{ marginTop: '8px' }}>{selectedOrder.city} / {selectedOrder.district}</p></div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>🛒 Ürünler</h3>
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <div><p style={{ fontWeight: 'bold' }}>{item.product_name}</p><p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{item.quantity} adet x {item.unit_price} TL</p></div>
                  <p style={{ fontWeight: 'bold', color: '#818cf8' }}>{item.quantity * item.unit_price} TL</p>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                <p style={{ fontWeight: 'bold' }}>Toplam</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#818cf8' }}>{Number(selectedOrder.total_price).toLocaleString()} TL</p>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>🚚 Kargo Bilgileri</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)' }}>Takip Numarası</p>
                  <input type="text" placeholder="Takip Numarası" className="modal-input" value={trackingForm.trackingNumber} onChange={(e) => setTrackingForm({...trackingForm, trackingNumber: e.target.value})} />
                </div>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)' }}>Kargo Şirketi</p>
                  <select className="modal-select" value={trackingForm.shippingCompany} onChange={(e) => setTrackingForm({...trackingForm, shippingCompany: e.target.value})}>
                    <option value="">Seçiniz</option>
                    <option value="Aras Kargo">Aras Kargo</option>
                    <option value="MNG Kargo">MNG Kargo</option>
                    <option value="PTT Kargo">PTT Kargo</option>
                    <option value="Yurtiçi Kargo">Yurtiçi Kargo</option>
                    <option value="UPS">UPS</option>
                  </select>
                </div>
              </div>
            </div>

            {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
              <div style={{ display: 'flex', gap: '12px' }}>
                {selectedOrder.status === 'pending' && <button onClick={() => updateOrderStatus(selectedOrder.id, 'processing')} className="modal-btn-submit" style={{ background: '#8b5cf6' }}>⚙️ Hazırlanıyor</button>}
                {selectedOrder.status === 'processing' && <button onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')} className="modal-btn-submit" style={{ background: '#3b82f6' }}>🚚 Kargoya Ver</button>}
                {selectedOrder.status === 'shipped' && <button onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')} className="modal-btn-submit" style={{ background: '#10b981' }}>✅ Teslim Edildi</button>}
                <button onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')} className="modal-btn-cancel" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }}>❌ İptal Et</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;