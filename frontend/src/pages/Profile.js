import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { stakingApi } from '../services/api';

const Profile = () => {
  const { currentUser } = useAuth();
  const [stakingBalance, setStakingBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStakingBalance = async () => {
      try {
        setLoading(true);
        const response = await stakingApi.getStakingBalance();
        setStakingBalance(response.data);
      } catch (error) {
        console.error('Ошибка при получении баланса стейкинга:', error);
        setError('Не удалось загрузить данные стейкинга');
      } finally {
        setLoading(false);
      }
    };

    fetchStakingBalance();
  }, []);

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return 'Н/Д';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  if (loading) {
    return <div className="container">Загрузка данных профиля...</div>;
  }

  return (
    <div className="container">
      <h2>Профиль пользователя</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="card">
        <h3>Информация о кошельке</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
          <div><strong>ID кошелька:</strong></div>
          <div>{currentUser?.wallet_id}</div>
          
          <div><strong>Тип кошелька:</strong></div>
          <div>{currentUser?.wallet_type}</div>
          
          <div><strong>Адрес:</strong></div>
          <div style={{ wordBreak: 'break-all' }}>{currentUser?.address}</div>
          
          <div><strong>Сеть:</strong></div>
          <div>{currentUser?.network_id === 1 ? 'Ethereum' : currentUser?.network_id === 3 ? 'TON' : currentUser?.network_id}</div>
          
          <div><strong>Дата регистрации:</strong></div>
          <div>{formatDate(currentUser?.created_at)}</div>
        </div>
      </div>

      <div className="card">
        <h3>Баланс стейкинга</h3>
        {stakingBalance?.staking_balance && stakingBalance.staking_balance.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Токен</th>
                <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Количество</th>
                <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Дата начала</th>
                <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Статус</th>
              </tr>
            </thead>
            <tbody>
              {stakingBalance.staking_balance.map((item, index) => (
                <tr key={index}>
                  <td style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>{item.token_symbol}</td>
                  <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{item.amount}</td>
                  <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{formatDate(item.staked_at)}</td>
                  <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>У вас пока нет активных стейкингов</p>
        )}
      </div>
    </div>
  );
};

export default Profile; 