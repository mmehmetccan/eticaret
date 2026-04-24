import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';
import { toast } from 'react-toastify';
import { Mail, ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react';

const EmailVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!email) {
      // E-posta yoksa register sayfasına yönlendir
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error('Lütfen 6 haneli doğrulama kodunu girin.');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/users/verify-email', { email, code });
      toast.success('✅ E-posta başarıyla doğrulandı! Yönlendiriliyorsunuz...');
      setIsVerified(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Doğrulama başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);
    try {
      await api.post('/users/resend-verification', { email });
      toast.success('📧 Yeni doğrulama kodu gönderildi!');
      setCountdown(60);
      setCode('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Kod gönderilemedi.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="verification-container">
      <div className="verification-card">
        <div className="verification-icon">
          <Mail size={48} />
        </div>
        
        <h2 className="verification-title">E-posta Doğrulama</h2>
        
        <p className="verification-subtitle">
          {email} adresine 6 haneli bir doğrulama kodu gönderdik.
          Lütfen kodu aşağıya girin.
        </p>

        <form onSubmit={handleVerify} className="verification-form">
          <div className="code-input-group">
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              className="code-input"
              autoFocus
              disabled={isVerified}
            />
          </div>

          <button 
            type="submit" 
            className="verify-btn"
            disabled={loading || isVerified}
          >
            {loading ? 'Doğrulanıyor...' : 'Hesabımı Doğrula'}
          </button>
        </form>

        <div className="resend-section">
          <button 
            onClick={handleResendCode}
            disabled={resendLoading || countdown > 0 || isVerified}
            className="resend-btn"
          >
            <RefreshCw size={16} />
            {resendLoading 
              ? 'Gönderiliyor...' 
              : countdown > 0 
                ? `${countdown} saniye sonra yeniden dene` 
                : 'Yeni kod gönder'}
          </button>
        </div>

        <div className="back-to-login">
          <button onClick={() => navigate('/login')} className="back-btn">
            <ArrowLeft size={16} />
            Giriş sayfasına dön
          </button>
        </div>
      </div>

      <style>{`
        .verification-container {
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
        }

        .verification-card {
          max-width: 480px;
          width: 100%;
          background: white;
          border-radius: 32px;
          padding: 48px 40px;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        }

        .verification-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: white;
        }

        .verification-title {
          font-size: 28px;
          font-weight: 900;
          color: #1e293b;
          margin-bottom: 12px;
        }

        .verification-subtitle {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 32px;
          line-height: 1.5;
        }

        .verification-form {
          margin-bottom: 24px;
        }

        .code-input-group {
          margin-bottom: 24px;
        }

        .code-input {
          width: 100%;
          padding: 16px;
          font-size: 24px;
          font-weight: 700;
          text-align: center;
          letter-spacing: 8px;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          outline: none;
          transition: all 0.3s;
        }

        .code-input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .verify-btn {
          width: 100%;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          padding: 14px 20px;
          border-radius: 40px;
          font-weight: 700;
          font-size: 16px;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }

        .verify-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
        }

        .verify-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .resend-section {
          margin-bottom: 20px;
        }

        .resend-btn {
          background: none;
          border: none;
          color: #4f46e5;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .resend-btn:hover:not(:disabled) {
          color: #7c3aed;
          text-decoration: underline;
        }

        .resend-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .back-btn {
          background: none;
          border: none;
          color: #64748b;
          font-size: 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s;
        }

        .back-btn:hover {
          color: #4f46e5;
        }
      `}</style>
    </div>
  );
};

export default EmailVerification;