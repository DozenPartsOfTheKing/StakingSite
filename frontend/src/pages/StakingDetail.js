import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { stakingApi, tokensApi } from '../services/api';

const StakingDetail = () => {
  const { id } = useParams();
  
  const [staking, setStaking] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unstakeLoading, setUnstakeLoading] = useState(false);
  const [unstakeSuccess, setUnstakeSuccess] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const fetchStakingDetails = async () => {
      try {
        setLoading(true);
        
        // Получаем данные стейкинга
        const stakingResponse = await stakingApi.getStaking(id);
        setStaking(stakingResponse.data);
        
        // Получаем информацию о токене
        const tokenResponse = await tokensApi.getToken(stakingResponse.data.token_id);
        setToken(tokenResponse.data);
        
        setError('');
      } catch (error) {
        console.error('Ошибка при получении данных стейкинга:', error);
        setError('Не удалось загрузить данные стейкинга');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStakingDetails();
    }
  }, [id]);

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return 'Н/Д';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Получение статуса стейкинга в читаемом виде
  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'unstaking': return 'Анстейкинг (в процессе)';
      case 'completed': return 'Завершен';
      default: return status;
    }
  };

  // Обработчик для показа диалога подтверждения
  const handleUnstakeClick = () => {
    setShowConfirmDialog(true);
  };

  // Обработчик отмены стейкинга
  const handleUnstake = async () => {
    try {
      setUnstakeLoading(true);
      setShowConfirmDialog(false);
      
      // Вызов API для отмены стейкинга
      await stakingApi.requestUnstake(id);
      
      setUnstakeSuccess('Запрос на анстейкинг принят. Процесс займет примерно 30 секунд');
      
      // Обновляем данные стейкинга через 1 секунду
      setTimeout(async () => {
        try {
          const response = await stakingApi.getStaking(id);
          setStaking(response.data);
        } catch (error) {
          console.error('Ошибка при обновлении данных стейкинга:', error);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Ошибка при отмене стейкинга:', error);
      setError(error.response?.data?.detail || 'Ошибка при отмене стейкинга');
    } finally {
      setUnstakeLoading(false);
    }
  };

  // Компонент для диалога подтверждения
  const ConfirmDialog = () => {
    if (!showConfirmDialog) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '5px',
          maxWidth: '400px',
          width: '100%'
        }}>
          <h3>Подтверждение</h3>
          <p>Вы уверены, что хотите отменить стейкинг?</p>
          <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
            <button 
              className="btn" 
              style={{backgroundColor: '#6c757d'}} 
              onClick={() => setShowConfirmDialog(false)}
            >
              Отмена
            </button>
            <button 
              className="btn" 
              style={{backgroundColor: '#d9534f', color: 'white'}} 
              onClick={handleUnstake}
              disabled={unstakeLoading}
            >
              {unstakeLoading ? 'Отмена стейкинга...' : 'Подтвердить'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container">
        <h2>Детали стейкинга</h2>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h2>Детали стейкинга</h2>
        <div className="alert alert-danger">{error}</div>
        <Link to="/staking" className="btn">Вернуться к списку стейкингов</Link>
      </div>
    );
  }

  if (!staking) {
    return (
      <div className="container">
        <h2>Детали стейкинга</h2>
        <p>Стейкинг не найден</p>
        <Link to="/staking" className="btn">Вернуться к списку стейкингов</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Детали стейкинга #{staking.staking_id}</h2>
      
      {unstakeSuccess && <div className="alert alert-success">{unstakeSuccess}</div>}
      
      <div className="card">
        <h3>Основная информация</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <p><strong>ID стейкинга:</strong> {staking.staking_id}</p>
            <p><strong>Токен:</strong> {token ? `${token.token_symbol} (${token.token_name})` : `Токен #${staking.token_id}`}</p>
            <p><strong>Количество:</strong> {staking.amount}</p>
            <p><strong>Сеть:</strong> {staking.network}</p>
            <p><strong>Тип стейкинга:</strong> {staking.staking_type}</p>
          </div>
          
          <div>
            <p><strong>Статус:</strong> {getStatusText(staking.staking_status)}</p>
            <p><strong>Дата начала:</strong> {formatDate(staking.staked_at)}</p>
            {staking.unstake_requested_at && (
              <p><strong>Запрос на анстейкинг:</strong> {formatDate(staking.unstake_requested_at)}</p>
            )}
            {staking.unstaked_at && (
              <p><strong>Дата завершения:</strong> {formatDate(staking.unstaked_at)}</p>
            )}
            <p><strong>Адрес кошелька:</strong> {staking.destination_address || 'Не указан'}</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/staking" className="btn" style={{ marginRight: '10px' }}>
            Вернуться к списку
          </Link>
          
          {staking.staking_status === 'active' && (
            <button 
              className="btn" 
              onClick={handleUnstakeClick}
              disabled={unstakeLoading}
              style={{ backgroundColor: '#d9534f', color: 'white' }}
            >
              {unstakeLoading ? 'Обработка...' : 'Анстейкинг'}
            </button>
          )}
        </div>
      </div>
      
      {token && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3>Информация о токене</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <p><strong>ID токена:</strong> {token.token_id}</p>
              <p><strong>Название:</strong> {token.token_name}</p>
              <p><strong>Символ:</strong> {token.token_symbol}</p>
            </div>
            
            <div>
              <p><strong>Сеть:</strong> {token.token_network}</p>
              <p><strong>Доступен для стейкинга:</strong> {token.staking_available ? 'Да' : 'Нет'}</p>
              <p><strong>Минимальный стейкинг:</strong> {token.min_stake || 'Не указано'}</p>
            </div>
          </div>
          
          <Link to={`/tokens?network=${token.token_network}`} className="btn" style={{ marginTop: '10px' }}>
            Посмотреть все токены {token.token_network}
          </Link>
        </div>
      )}
      
      <ConfirmDialog />
    </div>
  );
};

export default StakingDetail; 