import { useState } from 'react';
import api from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff, Phone, ChevronDown } from 'lucide-react';
import { phoneCodes } from '../data/phoneCodes';
import { toast } from 'react-toastify';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCode, setSelectedCode] = useState(phoneCodes[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCodeDropdown, setShowCodeDropdown] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  
    try {
    const res = await api.post('/users/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    
    toast.success(`🎉 Hoş geldiniz, ${res.data.user.full_name || 'Kullanıcı'}!`);
    
    if (res.data.user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  } catch (err) {
    const errorMsg = err.response?.data?.error || "E-posta veya şifre hatalı!";
    setError(errorMsg);
    
    // Hesap doğrulanmamışsa doğrulama sayfasına yönlendir
    if (err.response?.data?.needsVerification) {
      toast.warning('⚠️ Hesabınız doğrulanmamış. Lütfen e-posta adresinizi doğrulayın.');
      setTimeout(() => {
        navigate('/verify-email', { state: { email: err.response?.data?.email || email } });
      }, 1500);
    } else {
      toast.error(errorMsg);
    }
  } finally {
    setLoading(false);
  }
};

  const handleForgotPassword = async (e) => {
  e.preventDefault();
  setResetLoading(true);
  setResetError('');
  setResetMessage('');
  
  try {
    await api.post('/users/forgot-password', { email: forgotPasswordEmail });
    setResetMessage('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi!');
    toast.success('📧 Şifre sıfırlama bağlantısı gönderildi!');
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotPasswordEmail('');
      setResetMessage('');
    }, 3000);
  } catch (err) {
    const errorMsg = err.response?.data?.error || "Bir hata oluştu. Lütfen tekrar deneyin.";
    setResetError(errorMsg);
    toast.error(errorMsg);
  } finally {
    setResetLoading(false);
  }
};

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    setPhoneNumber(value);
  };

  // Inline CSS stilleri
  const containerStyle = {
    minHeight: 'calc(100vh - 80px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
    position: 'relative',
  };

  const cardStyle = {
    maxWidth: '460px',
    width: '100%',
    background: 'white',
    borderRadius: '48px',
    padding: '48px 40px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    position: 'relative',
    zIndex: 10,
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '36px',
  };

  const iconStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    borderRadius: '60px',
    marginBottom: '24px',
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: '8px',
  };

  const subtitleStyle = {
    fontSize: '14px',
    color: '#64748b',
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  };

  const formGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const labelStyle = {
    fontSize: '13px',
    fontWeight: '700',
    color: '#334155',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const inputWrapperStyle = {
    position: 'relative',
    width: '100%',
  };

  const inputStyle = {
    width: '100%',
    padding: '16px 18px',
    background: '#f8fafc',
    border: '2px solid #e2e8f0',
    borderRadius: '20px',
    fontSize: '15px',
    fontWeight: '500',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  const passwordToggleStyle = {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'all 0.2s',
  };

  const forgotStyle = {
    textAlign: 'right',
    marginTop: '-4px',
  };

  const forgotLinkStyle = {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
  };

  const buttonStyle = {
    width: '100%',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: 'white',
    padding: '16px 20px',
    borderRadius: '40px',
    fontWeight: '800',
    fontSize: '16px',
    cursor: 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '8px',
  };

  const dividerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    margin: '24px 0',
  };

  const dividerLineStyle = {
    flex: 1,
    height: '1px',
    background: '#e2e8f0',
  };

  const dividerTextStyle = {
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: '600',
  };

  const socialBtnStyle = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '14px 20px',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '40px',
    fontWeight: '600',
    fontSize: '14px',
    color: '#334155',
    cursor: 'pointer',
  };

  const registerLinkStyle = {
    textAlign: 'center',
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #f1f5f9',
  };

  const registerTextStyle = {
    fontSize: '14px',
    color: '#64748b',
  };

  const registerBtnStyle = {
    color: '#4f46e5',
    fontWeight: '800',
    textDecoration: 'none',
    marginLeft: '6px',
  };

  const errorStyle = {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '20px',
    padding: '14px 18px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const errorTextStyle = {
    color: '#dc2626',
    fontSize: '13px',
    fontWeight: '500',
  };

  // Modal stilleri
  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  };

  const modalStyle = {
    background: 'white',
    borderRadius: '32px',
    padding: '32px',
    maxWidth: '400px',
    width: '90%',
    textAlign: 'center',
  };

  const modalTitleStyle = {
    fontSize: '24px',
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: '16px',
  };

  const modalTextStyle = {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '24px',
  };

  const modalInputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: '#f8fafc',
    border: '2px solid #e2e8f0',
    borderRadius: '20px',
    fontSize: '14px',
    marginBottom: '20px',
    boxSizing: 'border-box',
  };

  const modalButtonStyle = {
    width: '100%',
    background: '#4f46e5',
    color: 'white',
    padding: '14px',
    borderRadius: '40px',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
  };

  const phoneWrapperStyle = {
    display: 'flex',
    gap: '10px',
  };

  const codeSelectorStyle = {
    position: 'relative',
    width: '110px',
  };

  const codeButtonStyle = {
    width: '100%',
    padding: '16px 12px',
    background: '#f8fafc',
    border: '2px solid #e2e8f0',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    color: '#1e293b',
  };

  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    maxHeight: '250px',
    overflowY: 'auto',
    zIndex: 10,
    marginTop: '4px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
  };

  const dropdownItemStyle = {
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'background 0.2s',
  };

  const phoneInputStyle = {
    flex: 1,
    padding: '16px 18px',
    background: '#f8fafc',
    border: '2px solid #e2e8f0',
    borderRadius: '20px',
    fontSize: '15px',
    fontWeight: '500',
    outline: 'none',
    fontFamily: 'inherit',
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={iconStyle}>
            <LogIn size={36} color="white" />
          </div>
          <h2 style={titleStyle}>Tekrar Hoş Geldin!</h2>
          <p style={subtitleStyle}>Hesabına erişmek için bilgilerini gir.</p>
        </div>

        {error && (
          <div style={errorStyle}>
            <AlertCircle size={18} color="#ef4444" />
            <span style={errorTextStyle}>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={formStyle}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>
              <Mail size={14} color="#4f46e5" />
              E-posta Adresi
            </label>
            <input 
              type="email" 
              placeholder="ornek@mail.com" 
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>
              <Lock size={14} color="#4f46e5" />
              Şifre
            </label>
            <div style={inputWrapperStyle}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                style={inputStyle}
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <button 
                type="button"
                style={passwordToggleStyle}
                onClick={() => setShowPassword(!showPassword)}
                onMouseEnter={(e) => e.currentTarget.style.background = '#eef2ff'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>
              <Phone size={14} color="#4f46e5" />
              Telefon (Opsiyonel)
            </label>
            <div style={phoneWrapperStyle}>
              <div style={codeSelectorStyle}>
                <button 
                  type="button"
                  style={codeButtonStyle}
                  onClick={() => setShowCodeDropdown(!showCodeDropdown)}
                >
                  <span>{selectedCode.flag} {selectedCode.code}</span>
                  <ChevronDown size={14} />
                </button>
                {showCodeDropdown && (
                  <div style={dropdownStyle}>
                    {phoneCodes.map((code) => (
                      <div
                        key={code.code}
                        style={dropdownItemStyle}
                        onClick={() => {
                          setSelectedCode(code);
                          setShowCodeDropdown(false);
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <span>{code.flag}</span>
                        <span>{code.code}</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{code.country}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <input 
                type="tel" 
                placeholder="5xx xxx xx xx" 
                style={phoneInputStyle}
                value={phoneNumber}
                onChange={handlePhoneChange}
                maxLength={10}
              />
            </div>
          </div>

          <div style={forgotStyle}>
            <button 
              type="button"
              style={forgotLinkStyle}
              onClick={() => setShowForgotModal(true)}
            >
              Şifremi Unuttum
            </button>
          </div>

          <button 
            type="submit" 
            style={buttonStyle}
            disabled={loading}
          >
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div style={dividerStyle}>
          <div style={dividerLineStyle}></div>
          <span style={dividerTextStyle}>veya</span>
          <div style={dividerLineStyle}></div>
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button style={socialBtnStyle}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google ile Devam Et
          </button>
        </div>

        <div style={registerLinkStyle}>
          <span style={registerTextStyle}>
            Hesabın yok mu?
            <Link to="/register" style={registerBtnStyle}>
              Hemen Kayıt Ol
            </Link>
          </span>
        </div>
      </div>

      {/* Şifremi Unuttum Modal */}
      {showForgotModal && (
        <div style={modalOverlayStyle} onClick={() => setShowForgotModal(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={modalTitleStyle}>Şifremi Unuttum</h3>
            <p style={modalTextStyle}>
              E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
            </p>
            {resetError && (
              <div style={{ ...errorStyle, marginBottom: '16px', padding: '10px' }}>
                <span style={errorTextStyle}>{resetError}</span>
              </div>
            )}
            {resetMessage && (
              <div style={{ background: '#dcfce7', borderRadius: '16px', padding: '12px', marginBottom: '16px', color: '#16a34a' }}>
                {resetMessage}
              </div>
            )}
            <input
              type="email"
              placeholder="E-posta adresiniz"
              style={modalInputStyle}
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              required
            />
            <button 
              style={modalButtonStyle}
              onClick={handleForgotPassword}
              disabled={resetLoading}
            >
              {resetLoading ? "Gönderiliyor..." : "Şifre Sıfırlama Bağlantısı Gönder"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;