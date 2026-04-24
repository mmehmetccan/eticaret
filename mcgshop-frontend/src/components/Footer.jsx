import { Link } from 'react-router-dom';
import { 
  ShoppingBag, ShieldCheck, Truck, CreditCard, Heart, 
  Mail, Phone, MapPin 
} from 'lucide-react';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Logo ve Açıklama */}
        <div className="footer-section">
          <div className="footer-logo">
            <ShoppingBag size={28} color="#667eea" />
            <span>MCG<span className="footer-logo-highlight">Shop</span></span>
          </div>
          <p className="footer-description">
            Türkiye'nin önde gelen online alışveriş platformu. 
            Binlerce ürün, uygun fiyatlar ve hızlı kargo ile 
            alışveriş keyfini yaşayın.
          </p>
          <div className="footer-social">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="5"/>
                <line x1="18.5" y1="5.5" x2="18.5" y2="5.5"/>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Hızlı Linkler */}
        <div className="footer-section">
          <h3 className="footer-title">Hızlı Linkler</h3>
          <ul className="footer-links">
            <li><Link to="/">Ana Sayfa</Link></li>
            <li><Link to="/profile">Profil</Link></li>
            <li><Link to="/cart">Sepetim</Link></li>
          </ul>
        </div>

        {/* Kurumsal */}
        <div className="footer-section">
          <h3 className="footer-title">Kurumsal</h3>
          <ul className="footer-links">
            <li><Link to="/about">Hakkımızda</Link></li>
            <li><Link to="/contact">İletişim</Link></li>
            <li><Link to="/privacy">Gizlilik Politikası</Link></li>
            <li><Link to="/terms">Kullanım Koşulları</Link></li>
            <li><Link to="/returns">İade Politikası</Link></li>
          </ul>
        </div>

        {/* İletişim */}
        <div className="footer-section">
          <h3 className="footer-title">İletişim</h3>
          <div className="footer-contact">
            <div className="contact-item">
              <MapPin size={16} />
              <span>İstanbul, Türkiye</span>
            </div>
            <div className="contact-item">
              <Phone size={16} />
              <span>+90 555 123 45 67</span>
            </div>
            <div className="contact-item">
              <Mail size={16} />
              <span>info@mcgshop.com</span>
            </div>
          </div>
        </div>

        {/* Ödeme ve Güvenlik */}
        <div className="footer-section">
          <h3 className="footer-title">Güvenli Alışveriş</h3>
          <div className="footer-badges">
            <div className="badge">
              <CreditCard size={20} />
              <span>100% Güvenli Ödeme</span>
            </div>
            <div className="badge">
              <Truck size={20} />
              <span>Hızlı Kargo</span>
            </div>
            <div className="badge">
              <ShieldCheck size={20} />
              <span>Orijinal Ürün Garantisi</span>
            </div>
          </div>
          <div className="payment-icons">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" />
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>&copy; {currentYear} MCGShop. Tüm hakları saklıdır.</p>
          <p className="footer-made-with">
            Made with <Heart size={14} fill="#ef4444" color="#ef4444" /> by MCG Team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;