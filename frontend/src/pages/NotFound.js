import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '50px 20px' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>404</h1>
      <h2 style={{ marginBottom: '30px' }}>Страница не найдена</h2>
      <p style={{ marginBottom: '30px' }}>
        Извините, запрашиваемая вами страница не существует или была перемещена.
      </p>
      <Link to="/" className="btn">
        Вернуться на главную
      </Link>
    </div>
  );
};

export default NotFound; 