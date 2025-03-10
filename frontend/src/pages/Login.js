import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { connectWallet } from '../utils/walletConnector';

// SVG icons for wallets
const TrustWalletIcon = () => (
  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#3375BB"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M16.0002 6.92442C19.5533 9.97332 24.1322 10.1695 25.8059 10.1695V15.3023C25.8059 21.6487 20.4261 24.9767 16.0002 26.9996C11.5742 24.9767 6.19434 21.6487 6.19434 15.3023V10.1695C7.87273 10.1695 12.4523 9.97332 16.0002 6.92442Z" fill="white"/>
  </svg>
);

const TonkeeperIcon = () => (
  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#0098EA"/>
    <path d="M22.9285 10.7143L15.9999 7.14288L9.07129 10.7143L15.9999 14.2857L22.9285 10.7143ZM9.07129 12.6429L15.9999 16.2143V24.8572L9.07129 21.2858V12.6429ZM22.9285 12.6429L15.9999 16.2143V24.8572L22.9285 21.2858V12.6429Z" fill="white"/>
  </svg>
);

const EthereumIcon = () => (
  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#627EEA"/>
    <path d="M16.498 4V12.87L23.995 16.22L16.498 4Z" fill="white" fillOpacity="0.602"/>
    <path d="M16.498 4L9 16.22L16.498 12.87V4Z" fill="white"/>
    <path d="M16.498 21.968V27.995L24 17.616L16.498 21.968Z" fill="white" fillOpacity="0.602"/>
    <path d="M16.498 27.995V21.967L9 17.616L16.498 27.995Z" fill="white"/>
    <path d="M16.498 20.573L23.995 16.22L16.498 12.872V20.573Z" fill="white" fillOpacity="0.2"/>
    <path d="M9 16.22L16.498 20.573V12.872L9 16.22Z" fill="white" fillOpacity="0.602"/>
  </svg>
);

const TonIcon = () => (
  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#0088CC"/>
    <path d="M22.9811 9.68421L21.4741 19.5789L18.4604 21.8947H13.5396L10.5259 19.5789L9.01892 9.68421H22.9811Z" fill="white"/>
    <path d="M16 15.7895L18.4604 13.4737L17.7078 18.9474H14.2922L13.5396 13.4737L16 15.7895Z" fill="#0088CC"/>
  </svg>
);

const Login = () => {
  // eslint-disable-next-line no-unused-vars
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('1'); // По умолчанию Ethereum
  const [walletType, setWalletType] = useState('Trust Wallet'); // По умолчанию Trust Wallet
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Определяем, является ли устройство мобильным
  useEffect(() => {
    const checkMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
    setIsMobileDevice(checkMobile());
  }, []);

  // Проверяем, запущен ли сервер
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        // Пробуем сделать простой запрос к серверу
        // Используем /users/health или просто корневой URL, так как /health может не существовать
        const response = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/`, 
          {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Проверяем статус ответа
        if (response.ok) {
          // Если запрос успешен, очищаем ошибку
          if (error && error.includes('Network Error')) {
            setError('');
          }
        } else {
          throw new Error(`Server responded with status: ${response.status}`);
        }
      } catch (err) {
        console.error('Server connection check failed:', err);
        // Если сервер недоступен, показываем ошибку
        setError('Network Error: Unable to connect to the server. Убедитесь, что сервер запущен.');
      }
    };
    
    checkServerConnection();
    // Проверяем соединение каждые 10 секунд
    const interval = setInterval(checkServerConnection, 10000);
    
    return () => clearInterval(interval);
  }, [error]);

  // Получаем доступные кошельки в зависимости от выбранной сети
  // eslint-disable-next-line no-unused-vars
  const getAvailableWallets = () => {
    if (network === '1') {
      return ['Trust Wallet'];
    }
    return ['Trust Wallet', 'Tonkeeper'];
  };

  // Обработчик изменения сети
  const handleNetworkChange = (e) => {
    const newNetwork = e.target.value;
    setNetwork(newNetwork);
    
    // Если выбран Ethereum и текущий кошелек - Tonkeeper, меняем на Trust Wallet
    if (newNetwork === '1' && walletType === 'Tonkeeper') {
      setWalletType('Trust Wallet');
    }
  };

  // Обработчик нажатия на кнопку подключения кошелька
  const handleWalletConnect = async (e) => {
    e.preventDefault();
    
    if (!network || !walletType) {
      setError('Пожалуйста, выберите сеть и тип кошелька');
      return;
    }
    
      setLoading(true);
      setError('');
      setSuccess('');
    
    try {
      console.log(`Connecting to ${walletType} on network ${network}`);
      
      // Если выбран Tonkeeper, проверяем наличие расширения
      if (walletType === 'Tonkeeper') {
        const isTonkeeperInstalled = document.querySelector('head meta[name="tonkeeper-extension"]') !== null ||
                                    (typeof window.ton !== 'undefined' && window.ton.isTonkeeper);
        
        if (!isTonkeeperInstalled) {
          // Открываем Chrome Web Store для установки расширения
          window.open('https://chromewebstore.google.com/detail/tonkeeper-%E2%80%94-wallet-for-to/omaabbefbmiijedngplfjmnooppbclkk', '_blank');
          setError('Расширение Tonkeeper не установлено. Мы открыли страницу для его установки. После установки обновите страницу и попробуйте снова.');
          setLoading(false);
          return;
        }
      }
      
      // Подключаемся к кошельку
      const networkType = network === '1' ? 'ETH' : 'TON';
      
      // Добавляем задержку перед подключением, чтобы избежать мигания ошибки
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = await connectWallet(networkType, walletType);
      
      if (!result) {
        setError('Не удалось подключиться к кошельку. Пожалуйста, убедитесь, что расширение установлено и активировано.');
        setLoading(false);
        return;
      }
      
      console.log('Wallet connection result:', result);
      
      // eslint-disable-next-line no-unused-vars
      const { address: walletAddress, signature, message } = result;
      
      if (!walletAddress || !signature) {
        setError('Не удалось получить адрес или подпись от кошелька');
        setLoading(false);
        return;
      }
      
      // Сохраняем адрес в состоянии
      setAddress(walletAddress);
      
      // Отправляем данные на сервер для аутентификации
      // Важно: передаем network как число, а не строку
      const networkId = parseInt(network, 10);
      
      try {
        // Используем функцию login из AuthContext
        const response = await login(walletAddress, networkId, signature, walletType);
        
        console.log('Login response:', response);
        
        // Проверяем ответ от сервера
        if (response && response.access_token) {
          setSuccess('Вход выполнен успешно!');
          
          // Перенаправляем на главную страницу
            setTimeout(() => {
            navigate('/');
          }, 1000);
        } else {
          setError('Ошибка аутентификации: токен не получен');
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        setError(`Ошибка при аутентификации: ${apiError.message}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Обработка специфических ошибок
      if (error.message && error.message.includes('User rejected')) {
        setError('Вы отклонили запрос на подключение кошелька');
      } else if (error.message && error.message.includes('extension not detected')) {
        setError('Расширение не обнаружено. Пожалуйста, установите расширение и обновите страницу.');
      } else if (error.message && error.message.includes('Opening Tonkeeper app')) {
        setError('Мы пытаемся открыть приложение Tonkeeper. Пожалуйста, завершите подключение в приложении.');
      } else if (error.message && error.message.includes('Network Error')) {
        setError('Ошибка сети: Не удалось подключиться к серверу. Убедитесь, что сервер запущен и доступен.');
      } else {
        setError(`Ошибка: ${error.message || 'Не удалось подключиться к кошельку'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Возвращает текст кнопки в зависимости от типа устройства
  // eslint-disable-next-line no-unused-vars
  const getButtonText = () => {
    if (loading) return 'Подключение...';
    if (isMobileDevice) return `Открыть ${walletType}`;
    return `Подключить ${walletType || 'кошелек'}`;
  };

  // Получаем иконку сети
  // eslint-disable-next-line no-unused-vars
  const getNetworkIcon = () => {
    if (network === '1') return <EthereumIcon />;
    if (network === '2') return <TonIcon />;
    return null;
  };

  // Получаем иконку кошелька
  // eslint-disable-next-line no-unused-vars
  const getWalletIcon = () => {
    if (walletType === 'Trust Wallet') return <TrustWalletIcon />;
    if (walletType === 'Tonkeeper') return <TonkeeperIcon />;
    return null;
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Вход через криптокошелек</h3>
            </div>
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}
          
          {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {success}
                  <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
            </div>
          )}
          
          <form onSubmit={handleWalletConnect}>
                <div className="mb-4">
                  <label htmlFor="network" className="form-label fw-bold">Выберите сеть</label>
                  <div className="d-flex gap-3">
                    <div className="form-check form-check-inline flex-fill">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="network"
                        id="network-eth"
                        value="1"
                        checked={network === '1'}
                        onChange={handleNetworkChange}
                      />
                      <label className="form-check-label d-flex align-items-center" htmlFor="network-eth">
                        <EthereumIcon />
                        <span className="ms-2">Ethereum</span>
              </label>
                </div>
                    
                    <div className="form-check form-check-inline flex-fill">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="network"
                        id="network-ton"
                        value="2"
                        checked={network === '2'}
                  onChange={handleNetworkChange}
                      />
                      <label className="form-check-label d-flex align-items-center" htmlFor="network-ton">
                        <TonIcon />
                        <span className="ms-2">TON</span>
                      </label>
                    </div>
                  </div>
                  <small className="text-muted d-block mt-2">
                    {network === '1' ? 'Для Ethereum доступен только Trust Wallet.' : 'Для TON доступны Trust Wallet и Tonkeeper.'}
                  </small>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="wallet-type" className="form-label fw-bold">Выберите кошелек</label>
                  <div className="d-flex gap-3">
                    <div className="form-check form-check-inline flex-fill">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="wallet-type"
                        id="wallet-trust"
                        value="Trust Wallet"
                        checked={walletType === 'Trust Wallet'}
                        onChange={(e) => setWalletType(e.target.value)}
                      />
                      <label className="form-check-label d-flex align-items-center" htmlFor="wallet-trust">
                        <TrustWalletIcon />
                        <span className="ms-2">Trust Wallet</span>
                      </label>
            </div>
            
                    {network === '2' && (
                      <div className="form-check form-check-inline flex-fill">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="wallet-type"
                          id="wallet-tonkeeper"
                          value="Tonkeeper"
                          checked={walletType === 'Tonkeeper'}
                          onChange={(e) => setWalletType(e.target.value)}
                        />
                        <label className="form-check-label d-flex align-items-center" htmlFor="wallet-tonkeeper">
                          <TonkeeperIcon />
                          <span className="ms-2">Tonkeeper</span>
              </label>
                      </div>
                    )}
              </div>
            </div>
            
                <div className="d-grid gap-2">
            <button
              type="submit"
                    className="btn btn-primary"
                    disabled={loading || !network || !walletType}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Подключение...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-wallet2 me-2"></i>
                        {isMobileDevice ? `Открыть ${walletType}` : `Подключить ${walletType}`}
                      </>
                    )}
            </button>
                  
                  {!loading && walletType && (
                    <div className="text-center mt-3">
                      <small className="text-muted">
                        Нет расширения {walletType}?
                      </small>
                      <a 
                        className="d-block text-primary mt-1" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        href={walletType === 'Trust Wallet' 
                          ? 'https://trustwallet.com/browser-extension' 
                          : 'https://chromewebstore.google.com/detail/tonkeeper-%E2%80%94-wallet-for-to/omaabbefbmiijedngplfjmnooppbclkk'}
                      >
                        <i className="bi bi-download me-1"></i>
                        Установить {walletType}
                      </a>
            </div>
          )}
                </div>
              </form>
              
              {/* Добавляем инструкции для пользователей */}
              <div className="mt-4 pt-3 border-top">
                <h5 className="mb-3">Инструкции по подключению</h5>
                
                {walletType === 'Trust Wallet' ? (
                  <div className="small">
                    <p className="mb-2"><strong>1.</strong> Убедитесь, что расширение Trust Wallet установлено в вашем браузере.</p>
                    <p className="mb-2"><strong>2.</strong> Нажмите кнопку "Подключить Trust Wallet" выше.</p>
                    <p className="mb-2"><strong>3.</strong> Подтвердите подключение в появившемся окне расширения.</p>
                    <p className="mb-2"><strong>4.</strong> Подпишите сообщение для аутентификации.</p>
                    <p className="mb-0 text-muted fst-italic">Примечание: Если вы не видите всплывающее окно, проверьте, что расширение активировано и разрешено для этого сайта.</p>
                  </div>
                ) : (
                  <div className="small">
                    <p className="mb-2"><strong>1.</strong> Убедитесь, что расширение Tonkeeper установлено в вашем браузере.</p>
                    <p className="mb-2"><strong>2.</strong> Нажмите кнопку "Подключить Tonkeeper" выше.</p>
                    <p className="mb-2"><strong>3.</strong> Если расширение не открывается автоматически, нажмите на его иконку в панели расширений браузера.</p>
                    <p className="mb-2"><strong>4.</strong> Подтвердите подключение в расширении и подпишите сообщение для аутентификации.</p>
                    <p className="mb-0 text-muted fst-italic">Примечание: Если у вас возникают проблемы, попробуйте обновить страницу или перезапустить браузер.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="card-footer bg-light p-3">
              <div className="text-center">
                <p className="mb-0 text-muted">
                  <i className="bi bi-shield-lock me-1"></i>
                  Безопасное подключение через криптокошелек без передачи приватных ключей
                </p>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 