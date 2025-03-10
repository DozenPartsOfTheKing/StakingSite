import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

// Создаем контекст
const AuthContext = createContext();

// Хук для использования контекста
export const useAuth = () => {
  return useContext(AuthContext);
};

// Провайдер контекста
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Проверяем токен при загрузке
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          // Устанавливаем токен в заголовок по умолчанию
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Запрашиваем информацию о пользователе
          const response = await api.get('/users/me');
          setCurrentUser(response.data);
        } catch (error) {
          console.error('Ошибка проверки токена:', error);
          // Если токен недействителен, удаляем его
          logout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  // Логин
  const login = async (address, network, signature = 'test_signature', wallet_type = 'Trust Wallet') => {
    try {
      setError('');
      const response = await api.post('/users/login', {
        address,
        network,
        signature,
        wallet_type
      });

      const { access_token } = response.data;
      
      // Сохраняем токен и тип кошелька
      localStorage.setItem('token', access_token);
      localStorage.setItem('wallet_type', wallet_type);
      setToken(access_token);
      
      // Устанавливаем токен в заголовок по умолчанию
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Получаем информацию о пользователе
      const userResponse = await api.get('/users/me');
      setCurrentUser({
        ...userResponse.data,
        wallet_type: wallet_type
      });
      
      return response.data;
    } catch (error) {
      console.error('Ошибка входа:', error);
      setError(error.response?.data?.detail || 'Ошибка при попытке входа');
      throw error;
    }
  };

  // Логаут
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    delete api.defaults.headers.common['Authorization'];
    
    // Вызываем API для выхода (удаления cookie)
    api.post('/users/logout').catch(error => {
      console.error('Ошибка при выходе:', error);
    });
  };

  // Значение контекста
  const value = {
    currentUser,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 