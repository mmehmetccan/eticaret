import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, Phone, Calendar, AlertCircle, CheckCircle, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { phoneCodes } from '../data/phoneCodes';
import { toast } from 'react-toastify';
import api from '../api/api';
import '../styles/register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '', email: '', password: '', 
    phone_number: '', gender: '', birth_date: ''
  });
  const [selectedCode, setSelectedCode] = useState(phoneCodes[0]);
  const [showCodeDropdown, setShowCodeDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setSuccess('');
  
  const fullPhoneNumber = formData.phone_number ? `${selectedCode.code}${formData.phone_number}` : '';
  
   try {
    const response = await api.post('/users/register', {
      ...formData,
      phone_number: fullPhoneNumber
    });
    
    setSuccess('Kayıt başarılı! Yönlendiriliyorsunuz...');
    toast.success('✅ Kayıt başarılı! E-posta doğrulama sayfasına yönlendiriliyorsunuz.');
    
    // Doğrulama sayfasına yönlendir
    setTimeout(() => {
      navigate('/verify-email', { state: { email: formData.email } });
    }, 1500);
    
  } catch (err) {
    const errorMsg = err.response?.data?.error || "Kayıt sırasında bir hata oluştu.";
    setError(errorMsg);
    toast.error(errorMsg);
  } finally {
    setLoading(false);
  }
};

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    setFormData({...formData, phone_number: value});
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="register-icon-wrapper">
            <UserPlus size={34} className="register-icon" />
          </div>
          <h2 className="register-title">Hesap Oluştur</h2>
          <p className="register-subtitle">MCG Shop ailesine katıl, fırsatları kaçırma!</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} className="error-icon" />
            <span className="error-text">{error}</span>
          </div>
        )}

        {success && (
          <div className="success-message">
            <CheckCircle size={18} className="success-icon" />
            <span className="success-text">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label className="form-label">
              <User size={14} className="form-label-icon" />
              Ad Soyad
            </label>
            <input 
              type="text" 
              placeholder="Mehmet Can Demir" 
              className="form-input"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Mail size={14} className="form-label-icon" />
              E-posta Adresi
            </label>
            <input 
              type="email" 
              placeholder="ornek@mail.com" 
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={14} className="form-label-icon" />
              Şifre
            </label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                className="form-input"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required 
              />
              <button 
                type="button"
                className="password-toggle-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Phone size={14} className="form-label-icon" />
              Telefon Numarası
            </label>
            <div className="phone-input-wrapper">
              <div className="code-selector">
                <button 
                  type="button"
                  className="code-button"
                  onClick={() => setShowCodeDropdown(!showCodeDropdown)}
                >
                  <span>{selectedCode.flag} {selectedCode.code}</span>
                  <ChevronDown size={14} />
                </button>
                {showCodeDropdown && (
                  <div className="code-dropdown">
                    {phoneCodes.map((code) => (
                      <div
                        key={code.code}
                        className="code-item"
                        onClick={() => {
                          setSelectedCode(code);
                          setShowCodeDropdown(false);
                        }}
                      >
                        <span>{code.flag}</span>
                        <span>{code.code}</span>
                        <span className="code-country">{code.country}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <input 
                type="tel" 
                placeholder="5xx xxx xx xx" 
                className="phone-input"
                value={formData.phone_number}
                onChange={handlePhoneChange}
                maxLength={10}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Cinsiyet</label>
              <select 
                className="form-select"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option value="">Seçiniz</option>
                <option value="Erkek">Erkek</option>
                <option value="Kadın">Kadın</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={14} className="form-label-icon" />
                Doğum Tarihi
              </label>
              <input 
                type="date" 
                className="form-input"
                value={formData.birth_date}
                onChange={(e) => setFormData({...formData, birth_date: e.target.value})} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={`register-btn ${loading ? 'register-btn-loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner-small"></div>
                Kayıt Yapılıyor...
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Kayıt Ol
              </>
            )}
          </button>
        </form>

        <div className="register-divider">
          <div className="divider-line"></div>
          <span className="divider-text">veya</span>
          <div className="divider-line"></div>
        </div>

        <div className="login-link">
          <span className="login-text">
            Zaten hesabın var mı?
            <Link to="/login" className="login-link-btn">
              Giriş Yap
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;