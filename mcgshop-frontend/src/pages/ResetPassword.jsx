import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validToken, setValidToken] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Token kontrolü (opsiyonel)
    if (!token) {
      setValidToken(false);
      setError('Geçersiz bağlantı.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır!');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor!');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/users/reset-password', { token, new_password: password });
      setSuccess(response.data.message || 'Şifreniz başarıyla sıfırlandı!');
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
    inputWrapper: {
      position: 'relative',
      width: '100%',
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
      paddingRight: '50px',
    },
    passwordToggle: {
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

  if (!validToken) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.iconWrapper}>
              <AlertCircle size={36} color="white" />
            </div>
            <h2 style={styles.title}>Geçersiz Bağlantı</h2>
            <p style={styles.subtitle}>
              Bu şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş olabilir.
            </p>
            <button
              onClick={() => navigate('/forgot-password')}
              style={styles.button}
            >
              Yeni Bağlantı İste
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <Lock size={36} color="white" />
          </div>
          <h2 style={styles.title}>Yeni Şifre Oluştur</h2>
          <p style={styles.subtitle}>
            Hesabın için yeni bir şifre belirle.
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
              <Lock size={14} color="#4f46e5" />
              Yeni Şifre
            </label>
            <div style={styles.inputWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                style={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Lock size={14} color="#4f46e5" />
              Yeni Şifre (Tekrar)
            </label>
            <div style={styles.inputWrapper}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                style={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                style={styles.passwordToggle}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Sıfırlanıyor..." : "Şifreyi Sıfırla"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;