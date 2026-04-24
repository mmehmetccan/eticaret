import axios from 'axios';
import { toast } from 'react-toastify';

// Environment değişkenlerini kontrol et
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const IS_PRODUCTION = import.meta.env.PROD;

console.log(`🚀 API URL: ${API_URL} (${IS_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT'})`);

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 saniye timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Token ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug için (sadece geliştirme)
    if (!IS_PRODUCTION) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Hata yönetimi
api.interceptors.response.use(
  (response) => {
    // Debug için (sadece geliştirme)
    if (!IS_PRODUCTION) {
      console.log(`📥 ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Network hatası
    if (error.code === 'ECONNABORTED') {
      toast.error('Bağlantı zaman aşımına uğradı. Lütfen tekrar deneyin.');
    } else if (error.message === 'Network Error') {
      toast.error('Sunucuya bağlanılamıyor. Lütfen daha sonra tekrar deneyin.');
    }
    
    // 401 Unauthorized - Token süresi dolmuş
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      if (token) {
        toast.error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    }
    
    // 403 Forbidden
    if (error.response?.status === 403) {
      toast.error('Bu işlem için yetkiniz bulunmuyor.');
    }
    
    // 404 Not Found
    if (error.response?.status === 404) {
      toast.error('İstenen kaynak bulunamadı.');
    }
    
    // 500 Server Error
    if (error.response?.status >= 500) {
      toast.error('Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.');
    }
    
    return Promise.reject(error);
  }
);

export default api;