import { RefreshCw } from 'lucide-react';
import '../styles/StaticPages.css';

const Returns = () => {
  return (
    <div className="static-page">
      <div className="static-page-header">
        <div className="static-page-icon">
          <RefreshCw size={36} color="white" />
        </div>
        <h1 className="static-page-title">İade Politikası</h1>
        <p className="static-page-subtitle">
          Memnuniyetiniz bizim için önemli, iade süreci hakkında bilgiler
        </p>
      </div>

      <div className="static-page-content">
        <p><strong>Son güncelleme:</strong> {new Date().toLocaleDateString('tr-TR')}</p>

        <h2>1. Cayma Hakkı</h2>
        <p>
          Tüketicinin Korunması Hakkında Kanun kapsamında, ürünü teslim aldığınız tarihten 
          itibaren <strong>14 (on dört) gün</strong> içinde hiçbir gerekçe göstermeksizin 
          ve cezai şart ödemeksizin siparişinizi iade edebilirsiniz.
        </p>

        <h2>2. İade Şartları</h2>
        <ul>
          <li>Ürün orijinal ambalajında ve kullanılmamış olmalıdır</li>
          <li>Ürün etiketi sökülmemiş ve hasar görmemiş olmalıdır</li>
          <li>Ürünün tüm aksesuarları (şarj aleti, kutu, hediye vb.) eksiksiz olmalıdır</li>
          <li>Faturanız tarafımıza ulaştırılmalıdır</li>
        </ul>

        <h2>3. İade Edilemeyen Ürünler</h2>
        <p>
          Aşağıdaki ürünler iade edilemez (Cayma Hakkı Yönetmeliği Madde 15):
        </p>
        <ul>
          <li>Kişisel kullanıma yönelik iç giyim ürünleri</li>
          <li>Kulaklık, makyaj malzemeleri gibi hijyenik ürünler</li>
          <li>DVD, CD, yazılım gibi çoğaltılabilen ürünler</li>
          <li>Abonelik sözleşmesi kapsamında sunulan hizmetler</li>
        </ul>

        <h2>4. İade Süreci</h2>
        <ol>
          <li>Hesabınızdan "Siparişlerim" bölümüne gidin</li>
          <li>İade etmek istediğiniz siparişi seçin</li>
          <li>"İade Talebi Oluştur" butonuna tıklayın</li>
          <li>Formu doldurarak talebinizi iletin</li>
          <li>Tarafımıza onay verdikten sonra ürünü kargolayın</li>
        </ol>

        <h2>5. Kargo Ücreti</h2>
        <p>
          İade kargo ücreti, iade nedeni firmamızdan kaynaklanıyorsa (hasarlı/yanlış ürün, 
          eksik gönderi) tarafımızca karşılanır. Diğer durumlarda iade kargo ücreti müşteriye aittir.
        </p>

        <h2>6. İade Süresi ve İade Tutarı</h2>
        <p>
          İade talebiniz onaylandıktan sonra, ürün firmamıza ulaştıktan itibaren 
          <strong>7 iş günü</strong> içinde iade işleminiz tamamlanır. İade tutarı, 
          ödeme yönteminize bağlı olarak 3-10 iş günü içinde hesabınıza yansır.
        </p>

        <h2>7. Hasarlı veya Bozuk Ürünler</h2>
        <p>
          Kargonuzu teslim alırken ürünün hasarlı veya bozuk olması durumunda, 
          kargo görevlisine tutanak tutturun ve derhal müşteri hizmetlerimizle iletişime geçin.
        </p>

        <h2>8. İletişim</h2>
        <p>
          İade süreciyle ilgili sorularınız için bize <strong>destek@mcgshop.com</strong> 
          adresinden ulaşabilir veya +90 555 123 45 67 numaralı telefondan bizi arayabilirsiniz.
        </p>
      </div>
    </div>
  );
};

export default Returns;