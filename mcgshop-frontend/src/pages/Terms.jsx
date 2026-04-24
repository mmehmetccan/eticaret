import { FileText } from 'lucide-react';
import '../styles/StaticPages.css';

const Terms = () => {
  return (
    <div className="static-page">
      <div className="static-page-header">
        <div className="static-page-icon">
          <FileText size={36} color="white" />
        </div>
        <h1 className="static-page-title">Kullanım Koşulları</h1>
        <p className="static-page-subtitle">
          MCGShop'u kullanırken uymanız gereken kurallar
        </p>
      </div>

      <div className="static-page-content">
        <p><strong>Son güncelleme:</strong> {new Date().toLocaleDateString('tr-TR')}</p>

        <h2>1. Genel Koşullar</h2>
        <p>
          MCGShop web sitesini kullanarak aşağıdaki kullanım koşullarını kabul etmiş sayılırsınız. 
          Bu koşulları kabul etmiyorsanız sitemizi kullanmayınız.
        </p>

        <h2>2. Hesap Güvenliği</h2>
        <p>
          Hesap bilgilerinizin güvenliğinden siz sorumlusunuz. Şifrenizi üçüncü şahıslarla 
          paylaşmayın. Hesabınızın yetkisiz kullanımı durumunda derhal bize bildirin.
        </p>

        <h2>3. Ürün Bilgileri ve Fiyatlar</h2>
        <ul>
          <li>Tüm ürün fiyatları KDV dahildir</li>
          <li>Fiyatlar önceden haber verilmeksizin değiştirilebilir</li>
          <li>Ürün görselleri temsilidir, gerçek üründen farklılık gösterebilir</li>
          <li>Stokta olmayan ürünler için sipariş iptal edilebilir</li>
        </ul>

        <h2>4. Sipariş ve Ödeme</h2>
        <p>
          Siparişinizin onaylanmasıyla birlikte ödeme yükümlülüğünüz başlar. Ödemenin 
          zamanında yapılmaması durumunda siparişiniz iptal edilebilir.
        </p>

        <h2>5. Teslimat</h2>
        <p>
          Siparişleriniz, iş günlerinde 24 saat içinde kargoya verilir. Teslimat süresi 
          kargo firmasına ve teslimat adresine bağlı olarak 1-5 iş günü arasında değişebilir.
        </p>

        <h2>6. İade ve Değişim</h2>
        <p>
          Cayma hakkı kapsamında, ürünü teslim aldıktan sonra 14 gün içinde iade edebilirsiniz. 
          İade koşulları için <a href="/returns">İade Politikası</a> sayfamızı ziyaret edin.
        </p>

        <h2>7. Yasal Uyarı</h2>
        <p>
          Sitemizdeki tüm içerikler (metin, görsel, logo vb.) MCGShop'a aittir. 
          İzin alınmadan kopyalanamaz, dağıtılamaz veya kullanılamaz.
        </p>

        <h2>8. Değişiklik Hakkı</h2>
        <p>
          MCGShop, bu kullanım koşullarını önceden haber vermeksizin değiştirme hakkını 
          saklı tutar. Güncel koşullar sitemizde yayınlandığı tarihten itibaren geçerlidir.
        </p>

        <h2>9. İletişim</h2>
        <p>
          Kullanım koşullarıyla ilgili sorularınız için: <strong>info@mcgshop.com</strong>
        </p>
      </div>
    </div>
  );
};

export default Terms;