import { Building2, Users, Award, Truck, ShieldCheck, Headphones } from 'lucide-react';
import '../styles/StaticPages.css';

const About = () => {
  return (
    <div className="static-page">
      <div className="static-page-header">
        <div className="static-page-icon">
          <Building2 size={36} color="white" />
        </div>
        <h1 className="static-page-title">Hakkımızda</h1>
        <p className="static-page-subtitle">
          MCGShop olarak alışveriş deneyimini yeniden tanımlıyoruz
        </p>
      </div>

      <div className="static-page-content">
        <h2>Biz Kimiz?</h2>
        <p>
          MCGShop, 2024 yılında kurulmuş, Türkiye'nin önde gelen online alışveriş 
          platformlarından biridir. Müşterilerimize en kaliteli ürünleri en uygun 
          fiyatlarla sunmayı hedefliyoruz.
        </p>

        <h2>Misyonumuz</h2>
        <p>
          Teknolojiyi ve yenilikleri takip ederek, müşterilerimize güvenli, hızlı 
          ve keyifli bir alışveriş deneyimi sunmak. Her bütçeye uygun ürün çeşitliliği 
          ile herkesin ihtiyaçlarına cevap vermek.
        </p>

        <h2>Vizyonumuz</h2>
        <p>
          Türkiye'nin en güvenilir ve tercih edilen e-ticaret platformu olmak. 
          Sektördeki yenilikleri takip ederek, müşteri memnuniyetini her zaman 
          ön planda tutmak.
        </p>

        <h2>Neden MCGShop?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', marginTop: '20px' }}>
          <div style={{ textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '16px' }}>
            <Truck size={40} color="#667eea" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Hızlı Kargo</h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Tüm siparişleriniz 24 saat içinde kargoya verilir</p>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '16px' }}>
            <ShieldCheck size={40} color="#667eea" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Güvenli Alışveriş</h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>256 bit SSL sertifikası ile güvenli ödeme</p>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '16px' }}>
            <Headphones size={40} color="#667eea" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>7/24 Destek</h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Uzman ekibimiz her zaman yanınızda</p>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '16px' }}>
            <Award size={40} color="#667eea" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Orijinal Ürün Garantisi</h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Tüm ürünlerimiz orijinal ve garantili</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;