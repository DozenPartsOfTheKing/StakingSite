import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { stakingApi, tokensApi } from '../services/api';

const Staking = () => {
  const [searchParams] = useSearchParams();
  const tokenIdParam = searchParams.get('token');
  
  const [stakingList, setStakingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewStakingForm, setShowNewStakingForm] = useState(!!tokenIdParam);
  
  // Для формы нового стейкинга
  const [tokens, setTokens] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [tokensLoading, setTokensLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState(tokenIdParam || '');
  const [amount, setAmount] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [networks, setNetworks] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [unstakeLoading, setUnstakeLoading] = useState(false);
  const [unstakeSuccess, setUnstakeSuccess] = useState('');

  // Получение списка стейкинга
  const fetchStakingList = async () => {
    try {
      setLoading(true);
      const response = await stakingApi.getStakingList();
      console.log('Fetched staking list:', response.data);
      setStakingList(response.data);
      setError('');
    } catch (error) {
      console.error('Ошибка при получении списка стейкинга:', error);
      setError('Не удалось загрузить список стейкинга');
    } finally {
      setLoading(false);
    }
  };

  // Загружаем список стейкинга при монтировании компонента
  useEffect(() => {
    fetchStakingList();
  }, []);

  // Получение списка доступных сетей
  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const response = await stakingApi.getNetworks();
        setNetworks(response.data.networks);
      } catch (error) {
        console.error('Ошибка при получении списка сетей:', error);
        setFormError('Не удалось загрузить список доступных сетей');
      }
    };

    fetchNetworks();
  }, []);

  // Обновление списка доступных кошельков при выборе сети
  useEffect(() => {
    if (selectedNetwork) {
      const network = networks.find(n => n.id === selectedNetwork);
      if (network) {
        setWallets(network.wallets);
        setSelectedWallet(''); // Сбрасываем выбранный кошелек
      }
    } else {
      setWallets([]);
    }
  }, [selectedNetwork, networks]);

  // Получение списка доступных токенов для стейкинга
  useEffect(() => {
    if (showNewStakingForm) {
      const fetchAvailableTokens = async () => {
        try {
          setTokensLoading(true);
          const response = await tokensApi.getAllTokens();
          // Фильтруем только токены, доступные для стейкинга
          const availableTokens = response.data.filter(token => token.staking_available);
          setTokens(availableTokens);
        } catch (error) {
          console.error('Ошибка при получении токенов:', error);
          setFormError('Не удалось загрузить список доступных токенов');
        } finally {
          setTokensLoading(false);
        }
      };

      fetchAvailableTokens();
    }
  }, [showNewStakingForm]);

  // Обработчик отправки формы стейкинга
  const handleStakingSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedToken || !amount || amount <= 0 || !selectedNetwork || !selectedWallet || !destinationAddress) {
      setFormError('Пожалуйста, заполните все поля корректно');
      return;
    }
    
    try {
      setFormError('');
      setFormLoading(true);
      
      const stakingData = {
        token_id: parseInt(selectedToken),
        amount: parseFloat(amount),
        network: selectedNetwork,
        destination_address: destinationAddress
      };
      
      console.log('Sending staking request:', stakingData);
      
      const response = await stakingApi.stakeTokens(stakingData);
      console.log('Staking response:', response);
      
      setFormSuccess('Стейкинг успешно создан!');
      
      // Немедленно обновляем список стейкинга
      await fetchStakingList();
      
      // Сбрасываем форму через 2 секунды
      setTimeout(() => {
        setShowNewStakingForm(false);
        setSelectedToken('');
        setAmount('');
        setSelectedNetwork('');
        setSelectedWallet('');
        setDestinationAddress('');
        setFormSuccess('');
      }, 2000);
      
    } catch (error) {
      console.error('Ошибка при создании стейкинга:', error);
      if (error.response && error.response.data && error.response.data.detail) {
        setFormError(error.response.data.detail);
      } else {
        setFormError('Произошла ошибка при создании стейкинга. Пожалуйста, проверьте консоль для деталей.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  // Обработчик запроса на анстейкинг
  const handleUnstake = async (stakingId) => {
    if (unstakeLoading) return;
    
    try {
      setUnstakeLoading(true);
      setUnstakeSuccess('');
      
      // Добавляем обработку ошибок
      const response = await stakingApi.requestUnstake(stakingId);
      console.log('Unstake response:', response);
      
      setUnstakeSuccess(`Запрос на анстейкинг принят. Процесс займет примерно 30 секунд`);
      
      // Обновляем список стейкинга через 1 секунду
      setTimeout(() => {
        fetchStakingList();
      }, 1000);
      
      // Скрываем сообщение об успехе через 5 секунд
      setTimeout(() => {
        setUnstakeSuccess('');
      }, 5000);
    } catch (error) {
      console.error('Unstake error:', error);
      // Показываем пользователю понятное сообщение об ошибке
      const errorMessage = error.response?.data?.detail || 
                          'Произошла ошибка при запросе на анстейкинг. Пожалуйста, попробуйте позже.';
      setFormError(errorMessage);
      
      // Скрываем сообщение об ошибке через 5 секунд
      setTimeout(() => {
        setFormError('');
      }, 5000);
    } finally {
      setUnstakeLoading(false);
    }
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return 'Н/Д';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  // Получение имени токена по ID
  const getTokenSymbol = (tokenId) => {
    const token = tokens.find(t => t.token_id === tokenId);
    return token ? token.token_symbol : `Токен #${tokenId}`;
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

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mb-0">Стейкинг</h1>
            {!showNewStakingForm && (
              <button 
                className="btn btn-primary" 
                onClick={() => setShowNewStakingForm(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Новый стейкинг
              </button>
            )}
          </div>
          <p className="text-muted mt-2">
            Управляйте вашими стейкинг-активами и получайте пассивный доход
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {formError && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {formError}
          <button type="button" className="btn-close" onClick={() => setFormError('')}></button>
        </div>
      )}

      {formSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {formSuccess}
          <button type="button" className="btn-close" onClick={() => setFormSuccess('')}></button>
        </div>
      )}

      {unstakeSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {unstakeSuccess}
          <button type="button" className="btn-close" onClick={() => setUnstakeSuccess('')}></button>
        </div>
      )}

      {showNewStakingForm && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-light d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Новый стейкинг</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setShowNewStakingForm(false)}
              aria-label="Close"
            ></button>
          </div>
          <div className="card-body">
            <form onSubmit={handleStakingSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="network" className="form-label">Сеть</label>
                  <select 
                    id="network"
                    className="form-select" 
                    value={selectedNetwork} 
                    onChange={(e) => setSelectedNetwork(e.target.value)}
                    disabled={formLoading}
                  >
                    <option value="">Выберите сеть</option>
                    {networks.map((network) => (
                      <option key={network.id} value={network.id}>
                        {network.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label htmlFor="token" className="form-label">Токен</label>
                  <select 
                    id="token"
                    className="form-select" 
                    value={selectedToken} 
                    onChange={(e) => setSelectedToken(e.target.value)}
                    disabled={!selectedNetwork || formLoading}
                  >
                    <option value="">Выберите токен</option>
                    {tokens.map((token) => (
                      <option key={token.token_id} value={token.token_id}>
                        {token.token_symbol} - {token.token_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="amount" className="form-label">Количество</label>
                  <div className="input-group">
                    <input 
                      type="number" 
                      id="amount"
                      className="form-control" 
                      placeholder="0.00" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={formLoading}
                      min="0"
                      step="0.01"
                    />
                    <span className="input-group-text">
                      {selectedToken ? getTokenSymbol(parseInt(selectedToken)) : 'TOKEN'}
                    </span>
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label htmlFor="wallet" className="form-label">Кошелек</label>
                  <select 
                    id="wallet"
                    className="form-select" 
                    value={selectedWallet} 
                    onChange={(e) => setSelectedWallet(e.target.value)}
                    disabled={formLoading}
                  >
                    <option value="">Выберите кошелек</option>
                    {wallets.map((wallet) => (
                      <option key={wallet} value={wallet}>
                        {wallet}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="destinationAddress" className="form-label">Адрес назначения</label>
                <input 
                  type="text" 
                  id="destinationAddress"
                  className="form-control" 
                  placeholder="Введите адрес кошелька" 
                  value={destinationAddress} 
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  disabled={formLoading}
                />
              </div>
              
              <div className="d-flex justify-content-end gap-2">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary" 
                  onClick={() => setShowNewStakingForm(false)}
                  disabled={formLoading}
                >
                  Отмена
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Обработка...
                    </>
                  ) : 'Создать стейкинг'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      ) : stakingList.length > 0 ? (
        <div className="row">
          {stakingList.map((staking) => (
            <div className="col-lg-6 mb-4" key={staking.staking_id}>
              <div className="card h-100 shadow-sm border-0 hover-shadow">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <span className="badge bg-primary me-2">{getTokenSymbol(staking.token_id)}</span>
                    Стейкинг #{staking.staking_id}
                  </h5>
                  <span className={`badge ${
                    staking.staking_status === 'active' ? 'bg-success' : 
                    staking.staking_status === 'unstaking' ? 'bg-warning' : 
                    staking.staking_status === 'completed' ? 'bg-secondary' : 'bg-info'
                  }`}>
                    {getStatusText(staking.staking_status)}
                  </span>
                </div>
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-6">
                      <p className="text-muted mb-1">Сумма</p>
                      <h5>{staking.amount} {getTokenSymbol(staking.token_id)}</h5>
                    </div>
                    <div className="col-6">
                      <p className="text-muted mb-1">Сеть</p>
                      <h5>{staking.network}</h5>
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-6">
                      <p className="text-muted mb-1">Дата создания</p>
                      <p>{formatDate(staking.created_at)}</p>
                    </div>
                    <div className="col-6">
                      <p className="text-muted mb-1">Статус</p>
                      <p>{getStatusText(staking.staking_status)}</p>
                    </div>
                  </div>
                  
                  <p className="text-muted mb-1">Адрес назначения</p>
                  <p className="text-break mb-3">{staking.destination_address}</p>
                  
                  <div className="d-flex justify-content-between align-items-center">
                    <Link 
                      to={`/staking/${staking.staking_id}`} 
                      className="btn btn-outline-primary btn-sm"
                    >
                      <i className="bi bi-info-circle me-1"></i>
                      Подробнее
                    </Link>
                    
                    {staking.staking_status === 'active' && (
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleUnstake(staking.staking_id)}
                        disabled={unstakeLoading}
                      >
                        {unstakeLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Обработка...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-box-arrow-left me-1"></i>
                            Анстейкинг
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center my-5 py-5">
          <i className="bi bi-wallet2 fs-1 text-muted mb-3 d-block"></i>
          <h3>У вас пока нет активных стейкингов</h3>
          <p className="text-muted mb-4">Создайте новый стейкинг, чтобы начать получать пассивный доход</p>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowNewStakingForm(true)}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Создать стейкинг
          </button>
        </div>
      )}
    </div>
  );
};

export default Staking; 