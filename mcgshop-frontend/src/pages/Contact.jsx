import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import '../styles/StaticPages.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simüle edilmiş gönderim (backend entegre edilebilir)
    setTimeout(() => {
      toast.success('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="static-page">
      <div className="static-page-header">
        <div className="static-page-icon">
          <Mail size={36} color="white" />
        </div>
        <h1 className="static-page-title">İletişim</h1>
        <p className="static-page-subtitle">
          Sorularınız, önerileriniz veya şikayetleriniz için bize ulaşın
        </p>
      </div>

      <div className="static-page-content">
        {/* İletişim Bilgileri */}
        <div className="contact-info-grid">
          <div className="contact-info-card">
            <div className="contact-info-icon">
              <Phone size={24} />
            </div>
            <h4>Telefon</h4>
            <p>+90 555 123 45 67</p>
            <p>+90 555 987 65 43</p>
          </div>
          <div className="contact-info-card">
            <div className="contact-info-icon">
              <Mail size={24} />
            </div>
            <h4>E-posta</h4>
            <p>info@mcgshop.com</p>
            <p>destek@mcgshop.com</p>
          </div>
          <div className="contact-info-card">
            <div className="contact-info-icon">
              <MapPin size={24} />
            </div>
            <h4>Adres</h4>
            <p>Levent, Büyükdere Cad. No:123</p>
            <p>34330 Beşiktaş/İstanbul</p>
          </div>
        </div>

        {/* İletişim Formu */}
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Bize Mesaj Gönderin</h2>
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="contact-form-row">
            <div className="contact-form-group">
              <label>Adınız Soyadınız *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Mehmet Can Demir"
              />
            </div>
            <div className="contact-form-group">
              <label>E-posta Adresiniz *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="ornek@mail.com"
              />
            </div>
          </div>
          <div className="contact-form-group">
            <label>Konu *</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="Mesajınızın konusu..."
            />
          </div>
          <div className="contact-form-group">
            <label>Mesajınız *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="5"
              placeholder="Mesajınızı buraya yazın..."
            />
          </div>
          <button type="submit" className="contact-submit-btn" disabled={loading}>
            <Send size={18} />
            {loading ? 'Gönderiliyor...' : 'Mesaj Gönder'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;