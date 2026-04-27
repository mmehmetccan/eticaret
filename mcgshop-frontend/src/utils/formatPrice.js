// src/utils/formatPrice.js

// API Base URL (resimler için)
export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://placehold.co/600x600/e2e8f0/64748b?text=No+Image';
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
const API_URL = 'http://82.29.168.62:5001/api';
  const BASE_URL = API_BASE_URL.replace('/api', '');
  
  if (imagePath.startsWith('/uploads/')) {
    return `${BASE_URL}${imagePath}`;
  }
  
  return imagePath;
};

// Sayıyı Türkiye formatında göster (Sadece Tam Sayı - 500 TL gibi)
export const formatPrice = (price) => {
  if (!price) return '0';
  const number = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(number)) return '0';
  
  // Kuruşları yuvarlayıp binlik ayracı (nokta) ekler
  return Math.round(number).toLocaleString('tr-TR');
};

// İndirimli fiyatı formatla (Sadece Tam Sayı)
export const formatDiscountedPrice = (price, discount) => {
  if (!discount || discount === 0) return formatPrice(price);
  
  let number = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(number)) return '0';
  
  const discounted = number - (number * discount / 100);
  return Math.round(discounted).toLocaleString('tr-TR');
};

// Backend'e göndermek için fiyatı temizle (Sadece rakamları tutar)
export const cleanPrice = (val) => {
  if (!val) return 0;
  if (typeof val === 'number') return Math.round(val);
  
  // Önce noktaları sil, sonra rakam dışı her şeyi at
  let str = val.toString().split('.')[0].replace(/[^0-9]/g, '');
  return parseInt(str) || 0;
};

// Admin panelinde input içinde görünecek "ham" sayı (Örn: 500)
export const getRawPrice = (price) => {
  if (price === null || price === undefined || price === '') return '';
  
  // Eğer string "500.00" gelirse bunu 500'e çevirir
  let num = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(num)) return '';
  
  return Math.round(num).toString();
};