import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Компонент для защищенных маршрутов
const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Показываем индикатор загрузки, пока проверяем токен
  if (loading) {
    return <div className="container">Загрузка...</div>;
  }
  
  // Если пользователь не аутентифицирован, перенаправляем на страницу входа
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute; 