import { Shield } from 'lucide-react';
import '../styles/StaticPages.css';

const Privacy = () => {
  return (
    <div className="static-page">
      <div className="static-page-header">
        <div className="static-page-icon">
          <Shield size={36} color="white" />
        </div>
        <h1 className="static-page-title">Gizlilik Politikası</h1>
        <p className="static-page-subtitle">
          Kişisel verilerinizin güvenliği bizim için önemlidir
        </p>
      </div>

      <div className="static-page-content">
        <p><strong>Son güncelleme:</strong> {new Date().toLocaleDateString('tr-TR')}</p>

        <h2>1. Toplanan Bilgiler</h2>
        <p>
          MCGShop olarak, size daha iyi hizmet verebilmek için aşağıdaki bilgileri toplayabiliriz:
        </p>
        <ul>
          <li>Ad, soyad, e-posta adresi, telefon numarası</li>
          <li>Teslimat adresi, fatura adresi</li>
          <li>Ödeme bilgileri (kredi kartı bilgileriniz 3. parti ödeme kuruluşları tarafından işlenir)</li>
          <li>Alışveriş geçmişiniz ve tercihleriniz</li>
          <li>IP adresiniz, tarayıcı bilgileriniz ve site kullanım istatistikleriniz</li>
        </ul>

        <h2>2. Bilgilerin Kullanımı</h2>
        <p>
          Topladığımız bilgileri aşağıdaki amaçlarla kullanabiliriz:
        </p>
        <ul>
          <li>Siparişlerinizi işleme almak ve teslimatı sağlamak</li>
          <li>Müşteri hizmetleri desteği sunmak</li>
          <li>Site deneyiminizi iyileştirmek</li>
          <li>Yasal yükümlülükleri yerine getirmek</li>
          <li>Size özel kampanya ve fırsatları iletmek (onayınızla)</li>
        </ul>

        <h2>3. Bilgilerin Paylaşımı</h2>
        <p>
          Kişisel bilgileriniz, yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz. 
          Hizmet sağlayıcılarımız (kargo firmaları, ödeme kuruluşları) ile yalnızca hizmetin 
          gerektirdiği ölçüde paylaşılır.
        </p>

        <h2>4. Çerezler (Cookies)</h2>
        <p>
          Web sitemizde deneyiminizi geliştirmek için çerezler kullanıyoruz. Çerezleri 
          tarayıcı ayarlarınızdan devre dışı bırakabilirsiniz, ancak bu durumda sitenin 
          bazı özellikleri düzgün çalışmayabilir.
        </p>

        <h2>5. Veri Güvenliği</h2>
        <p>
          Kişisel verileriniz, 256 bit SSL sertifikası ile şifrelenerek korunmaktadır. 
          Yetkisiz erişim, veri kaybı veya ifşasına karşı gerekli güvenlik önlemleri alınmıştır.
        </p>

        <h2>6. Haklarınız</h2>
        <p>
          KVKK kapsamında aşağıdaki haklara sahipsiniz:
        </p>
        <ul>
          <li>Bilgilerinizin işlenip işlenmediğini öğrenme</li>
          <li>Eksik veya yanlış işlenen bilgilerin düzeltilmesini isteme</li>
          <li>Verilerin silinmesini isteme</li>
          <li>Verilerin taşınabilirliği talebinde bulunma</li>
        </ul>

        <h2>7. İletişim</h2>
        <p>
          Gizlilik politikamızla ilgili sorularınız için bize <strong>info@mcgshop.com</strong> 
          adresinden ulaşabilirsiniz.
        </p>
      </div>
    </div>
  );
};

export default Privacy;