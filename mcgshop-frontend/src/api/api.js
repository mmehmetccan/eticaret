import axios from 'axios';
import { toast } from 'react-toastify';

/**
 * URL Yapılandırması:
 * Canlı ortamda (Production) domain üzerinden, 
 * yerelde (Development) ise kendi bilgisayarındaki port üzerinden çalışır.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://uskozmetik.com/api';
const IS_PRODUCTION = import.meta.env.PROD;

console.log(`🚀 API URL: ${API_URL} | Mod: ${IS_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT'}`);

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (!IS_PRODUCTION) {
      console.log(`📤 [API REQUEST] ${config.method?.toUpperCase()} -> ${config.url}`);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    if (!IS_PRODUCTION) {
      console.log(`📥 [API RESPONSE] ${response.status} <- ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.error || error.response?.data?.message;

    // Özel Hata Mesajlarını Göster (Backend'den gelen spesifik hatalar için)
    if (errorMessage) {
      toast.error(errorMessage);
    } else {
      // Genel Durum Hataları
      if (error.code === 'ECONNABORTED') {
        toast.error('Bağlantı zaman aşımına uğradı.');
      } else if (status === 401) {
        if (localStorage.getItem('token')) {
          toast.error('Oturum süreniz doldu, tekrar giriş yapın.');
          localStorage.clear();
          setTimeout(() => window.location.href = '/login', 1500);
        }
      } else if (status === 403) {
        toast.error('Bu işlem için yetkiniz yok.');
      } else if (status === 404) {
        toast.error('Kaynak bulunamadı.');
      } else if (status >= 500) {
        toast.error('Sunucu hatası! Lütfen teknik ekibe bildirin.');
      } else {
        toast.error('Bir bağlantı hatası oluştu.');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;