import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tokensApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Network icons
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

const Tokens = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('all');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        let response;
        
        if (selectedNetwork === 'all') {
          response = await tokensApi.getAllTokens();
        } else {
          response = await tokensApi.getTokensByNetwork(selectedNetwork);
        }
        
        setTokens(response.data);
        setError('');
      } catch (error) {
        console.error('Ошибка при получении токенов:', error);
        setError('Не удалось загрузить список токенов');
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [selectedNetwork]);

  const getNetworkName = (networkId) => {
    switch (networkId) {
      case 1:
        return 'Ethereum';
      case 3:
        return 'TON';
      default:
        return `Сеть #${networkId}`;
    }
  };

  const getNetworkIcon = (networkId) => {
    switch (networkId) {
      case 1:
        return <EthereumIcon />;
      case 3:
        return <TonIcon />;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Header Section */}
      <section style={{
        background: 'linear-gradient(135deg, #6c63ff, #3b5998)',
        color: 'white',
        padding: '40px 0',
        marginBottom: '30px',
        position: 'relative'
      }}>
        <div className="container">
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700',
            marginBottom: '10px',
            textAlign: 'center'
          }}>
            Доступные токены
          </h1>
          <p style={{ 
            textAlign: 'center',
            opacity: '0.9',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            Ознакомьтесь с токенами, доступными для стейкинга, и выберите подходящий для вашей стратегии.
          </p>
        </div>
        
        {/* Curved bottom */}
        <div style={{
          position: 'absolute',
          bottom: '-1px',
          left: 0,
          right: 0,
          height: '30px',
          background: 'white',
          borderTopLeftRadius: '50% 100%',
          borderTopRightRadius: '50% 100%'
        }}></div>
      </section>

      <div className="container" style={{ marginBottom: '60px' }}>
        {error && (
          <div style={{ 
            padding: '15px', 
            borderRadius: '8px', 
            backgroundColor: '#fff5f5', 
            color: '#e53e3e', 
            marginBottom: '20px',
            border: '1px solid #fed7d7' 
          }}>
            <strong>Ошибка:</strong> {error}
          </div>
        )}
        
        {/* Filter */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          background: 'white',
          marginBottom: '30px'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#333' }}>
            Токены
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label htmlFor="network-filter" style={{ marginRight: '10px', fontWeight: '500', color: '#4a5568' }}>
              Фильтр по сети:
            </label>
            <div style={{ position: 'relative' }}>
              <select
                id="network-filter"
                style={{ 
                  padding: '10px 12px 10px 40px', 
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  appearance: 'none',
                  fontSize: '16px',
                  backgroundColor: '#fff',
                  minWidth: '160px',
                  paddingRight: '32px'
                }}
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value)}
              >
                <option value="all">Все сети</option>
                <option value="1">Ethereum</option>
                <option value="3">TON</option>
              </select>
              <div style={{ 
                position: 'absolute', 
                right: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }}>
                {selectedNetwork === 'all' ? 
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 21H21" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 10H21" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 6L12 3L19 6" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 10V21" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20 10V21" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 14V17" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 14V17" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 14V17" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                : selectedNetwork === '1' ? <EthereumIcon /> : <TonIcon />}
              </div>
            </div>
          </div>
        </div>

        {/* Tokens Table */}
        <div style={{ 
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          background: 'white'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ 
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '4px solid rgba(108, 99, 255, 0.2)',
                borderRadius: '50%',
                borderTopColor: '#6c63ff',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ marginTop: '15px', fontSize: '1.1rem', color: '#4a5568' }}>Загрузка токенов...</p>
            </div>
          ) : tokens.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ 
                      textAlign: 'left', 
                      padding: '16px 12px', 
                      borderBottom: '1px solid #e2e8f0',
                      color: '#4a5568',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>Токен</th>
                    <th style={{ 
                      textAlign: 'center', 
                      padding: '16px 12px', 
                      borderBottom: '1px solid #e2e8f0',
                      color: '#4a5568',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>Символ</th>
                    <th style={{ 
                      textAlign: 'center', 
                      padding: '16px 12px', 
                      borderBottom: '1px solid #e2e8f0',
                      color: '#4a5568',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>Сеть</th>
                    <th style={{ 
                      textAlign: 'center', 
                      padding: '16px 12px', 
                      borderBottom: '1px solid #e2e8f0',
                      color: '#4a5568',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>Доступен для стейкинга</th>
                    <th style={{ 
                      textAlign: 'right', 
                      padding: '16px 12px', 
                      borderBottom: '1px solid #e2e8f0',
                      color: '#4a5568',
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token) => (
                    <tr key={token.token_id} style={{ 
                      transition: 'background-color 0.2s',
                      ':hover': { backgroundColor: '#f9fafb' }
                    }}>
                      <td style={{ 
                        textAlign: 'left', 
                        padding: '16px 12px', 
                        borderBottom: '1px solid #e2e8f0',
                        color: '#1a202c',
                        fontWeight: '500'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '50%', 
                            background: '#6c63ff', 
                            color: 'white', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            marginRight: '12px',
                            fontSize: '16px'
                          }}>
                            {token.token_name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{token.token_name}</div>
                            <div style={{ fontSize: '0.875rem', color: '#718096' }}>ID: {token.token_id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ 
                        textAlign: 'center', 
                        padding: '16px 12px', 
                        borderBottom: '1px solid #e2e8f0',
                        fontFamily: 'monospace',
                        fontWeight: '600',
                        fontSize: '0.95rem'
                      }}>
                        {token.token_symbol}
                      </td>
                      <td style={{ 
                        textAlign: 'center', 
                        padding: '16px 12px', 
                        borderBottom: '1px solid #e2e8f0'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ marginRight: '8px' }}>
                            {getNetworkIcon(token.token_network_id)}
                          </div>
                          {getNetworkName(token.token_network_id)}
                        </div>
                      </td>
                      <td style={{ 
                        textAlign: 'center', 
                        padding: '16px 12px', 
                        borderBottom: '1px solid #e2e8f0'
                      }}>
                        {token.staking_available ? (
                          <div style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            padding: '6px 12px',
                            borderRadius: '50px',
                            background: '#f0fff4',
                            color: '#38a169',
                            fontWeight: '500'
                          }}>
                            <svg style={{ marginRight: '6px' }} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5 13L9 17L19 7" stroke="#38a169" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Доступен
                          </div>
                        ) : (
                          <div style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            padding: '6px 12px',
                            borderRadius: '50px',
                            background: '#fff5f5',
                            color: '#e53e3e',
                            fontWeight: '500'
                          }}>
                            <svg style={{ marginRight: '6px' }} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18 6L6 18" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6 6L18 18" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Недоступен
                          </div>
                        )}
                      </td>
                      <td style={{ 
                        textAlign: 'right', 
                        padding: '16px 12px', 
                        borderBottom: '1px solid #e2e8f0'
                      }}>
                        {token.staking_available ? (
                          <Link 
                            to={`/staking?token=${token.token_id}`} 
                            style={{
                              backgroundColor: '#6c63ff',
                              color: 'white',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              fontWeight: '500',
                              display: 'inline-block',
                              transition: 'all 0.2s'
                            }}
                          >
                            Стейкинг
                          </Link>
                        ) : (
                          <button 
                            style={{
                              padding: '8px 16px',
                              borderRadius: '8px',
                              border: 'none',
                              backgroundColor: '#e2e8f0',
                              color: '#718096',
                              fontWeight: '500',
                              cursor: 'not-allowed'
                            }}
                            disabled
                          >
                            Недоступен
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center',
              padding: '40px 0',
              color: '#718096'
            }}>
              <svg style={{ marginBottom: '15px' }} width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V14" stroke="#718096" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17.5 3.5V2.5" stroke="#718096" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21.5 7.5H20.5" stroke="#718096" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21.5 3.5H20.5" stroke="#718096" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17.5 7.5V6.5" stroke="#718096" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17.5 10.5V9.5" stroke="#718096" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.5 3.5H14.5" stroke="#718096" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 14L19 9" stroke="#718096" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 15L10 17H14L15 15" stroke="#718096" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p style={{ fontSize: '1.1rem' }}>Токены не найдены</p>
              <p>Попробуйте изменить параметры фильтрации</p>
            </div>
          )}
        </div>
      </div>
      
      {/* CTA Section */}
      {!isAuthenticated && (
        <section style={{
          background: 'linear-gradient(135deg, #6c63ff, #3b5998)',
          color: 'white',
          padding: '60px 0',
          textAlign: 'center'
        }}>
          <div className="container">
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: '700',
              marginBottom: '20px'
            }}>
              Готовы начать стейкинг?
            </h2>
            
            <p style={{ 
              fontSize: '1.2rem', 
              opacity: '0.9',
              maxWidth: '700px',
              margin: '0 auto 30px'
            }}>
              Войдите в свой аккаунт, чтобы получить доступ к стейкингу и начать зарабатывать вознаграждения.
            </p>
            
            <Link to="/login" style={{
              backgroundColor: 'white',
              color: '#6c63ff',
              padding: '16px 32px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '1.1rem',
              textDecoration: 'none',
              display: 'inline-block',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              Войти в аккаунт
            </Link>
          </div>
        </section>
      )}
      
      {/* Add animation styles */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          tr:hover {
            background-color: #f9fafb;
          }
        `}
      </style>
    </div>
  );
};

export default Tokens; 