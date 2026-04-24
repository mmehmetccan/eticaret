import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/users/forgot-password', { email });
      setSuccess(response.data.message || 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
    },
    card: {
      maxWidth: '460px',
      width: '100%',
      background: 'white',
      borderRadius: '48px',
      padding: '48px 40px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },
    header: {
      textAlign: 'center',
      marginBottom: '36px',
    },
    iconWrapper: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '80px',
      height: '80px',
      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      borderRadius: '60px',
      marginBottom: '24px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '900',
      color: '#1e293b',
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '14px',
      color: '#64748b',
      marginBottom: '24px',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    label: {
      fontSize: '13px',
      fontWeight: '700',
      color: '#334155',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    input: {
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
    },
    button: {
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
    },
    backLink: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '24px',
      color: '#64748b',
      textDecoration: 'none',
      fontSize: '14px',
    },
    errorMessage: {
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '20px',
      padding: '14px 18px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    errorText: {
      color: '#dc2626',
      fontSize: '13px',
      fontWeight: '500',
    },
    successMessage: {
      background: '#dcfce7',
      border: '1px solid #bbf7d0',
      borderRadius: '20px',
      padding: '14px 18px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    successText: {
      color: '#16a34a',
      fontSize: '13px',
      fontWeight: '500',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <Mail size={36} color="white" />
          </div>
          <h2 style={styles.title}>Şifremi Unuttum</h2>
          <p style={styles.subtitle}>
            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
          </p>
        </div>

        {error && (
          <div style={styles.errorMessage}>
            <AlertCircle size={18} color="#ef4444" />
            <span style={styles.errorText}>{error}</span>
          </div>
        )}

        {success && (
          <div style={styles.successMessage}>
            <CheckCircle size={18} color="#16a34a" />
            <span style={styles.successText}>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Mail size={14} color="#4f46e5" />
              E-posta Adresi
            </label>
            <input
              type="email"
              placeholder="ornek@mail.com"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Gönderiliyor..." : "Şifre Sıfırlama Bağlantısı Gönder"}
          </button>
        </form>

        <Link to="/login" style={styles.backLink}>
          <ArrowLeft size={16} />
          Giriş sayfasına dön
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;