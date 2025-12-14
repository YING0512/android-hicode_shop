import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrdersPage from './pages/OrdersPage';
import WalletPage from './pages/WalletPage';
import AdminCodePage from './pages/AdminCodePage';

import SellerPage from './pages/SellerPage';
import SellerDashboard from './pages/SellerDashboard';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }} basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/admin/codes" element={<AdminCodePage />} />
          <Route path="/seller" element={<SellerDashboard />} />
          <Route path="/seller/add" element={<SellerPage />} />
          <Route path="/seller/edit/:productId" element={<SellerPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
