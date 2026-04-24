import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, roleRequired }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  // 1. Giriş yapılmamışsa login'e at
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Belirli bir rol gerekiyorsa (Örn: admin) ve kullanıcı o role sahip değilse ana sayfaya at
  if (roleRequired && user.role !== roleRequired) {
    return <Navigate to="/" replace />;
  }

  // 3. Her şey yolundaysa istenen sayfayı göster
  return children;
};

export default ProtectedRoute;