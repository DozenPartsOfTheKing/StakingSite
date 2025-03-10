import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Компоненты
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Страницы
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Tokens from './pages/Tokens';
import Staking from './pages/Staking';
import StakingDetail from './pages/StakingDetail';
import NotFound from './pages/NotFound';

// Стили
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Публичные маршруты */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/tokens" element={<Tokens />} />
              
              {/* Защищенные маршруты */}
              <Route element={<PrivateRoute />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/staking" element={<Staking />} />
                <Route path="/staking/:id" element={<StakingDetail />} />
              </Route>
              
              {/* Страница 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 