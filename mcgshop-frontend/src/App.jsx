import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import ProductDetail from './pages/ProductDetail';
import SearchPage from './pages/SearchPage';  
import CategoryPage from './pages/CategoryPage.jsx';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword'; 
import CategoryProducts from './pages/CategoryProducts';
import EmailVerification from './pages/EmailVerification';


import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Returns from './pages/Returns';

function App() {
  return (
    <Router>
      <Navbar />
        <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          borderRadius: '16px',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/search" element={<SearchPage />} /> 
        <Route path="/category/:categoryId" element={<CategoryPage />} />
        <Route path="/category/:categoryId/:subCategoryId" element={<CategoryPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />        
        <Route path="/reset-password/:token" element={<ResetPassword />} /> 
        <Route path="/category-products/:type" element={<CategoryProducts />} />
        <Route path="/verify-email" element={<EmailVerification />} />


        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/returns" element={<Returns />} />

        <Route path="/admin" element={
          <ProtectedRoute roleRequired="admin">
            <AdminPanel />
          </ProtectedRoute>
        } />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;