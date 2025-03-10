import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// SVG icons for features
const SecurityIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L3 7V12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12V7L12 2Z" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 16C13.6569 16 15 14.6569 15 13C15 11.3431 13.6569 10 12 10C10.3431 10 9 11.3431 9 13C9 14.6569 10.3431 16 12 16Z" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 16V19" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 10V7" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FlexibilityIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 14L12 18L3 14" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 10L12 14L3 10" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 6L12 10L3 6" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 22V18" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TransparencyIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 21H6C5.46957 21 4.96086 20.7893 4.58579 20.4142C4.21071 20.0391 4 19.5304 4 19V5C4 4.46957 4.21071 3.96086 4.58579 3.58579C4.96086 3.21071 5.46957 3 6 3H18C18.5304 3 19.0391 3.21071 19.4142 3.58579C19.7893 3.96086 20 4.46957 20 5V19C20 19.5304 19.7893 20.0391 19.4142 20.4142C19.0391 20.7893 18.5304 21 18 21H14" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 17L16 13L12 9" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 13H8" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const RewardIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Home = () => {
  // eslint-disable-next-line no-unused-vars
  const { isAuthenticated, currentUser } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #6c63ff, #3b5998)',
        color: 'white',
        padding: '80px 0 100px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ 
            maxWidth: '700px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: '700',
              marginBottom: '20px',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              Стейкинг криптовалют с максимальной выгодой
            </h1>
            
            <p style={{ 
              fontSize: '1.25rem', 
              opacity: '0.9',
              lineHeight: '1.6',
              marginBottom: '40px'
            }}>
              Безопасная платформа для стейкинга в сетях Ethereum и TON.
              Увеличивайте свои активы, поддерживая работу блокчейнов.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              {isAuthenticated ? (
                <Link to="/staking" style={{
                  backgroundColor: 'white',
                  color: '#6c63ff',
                  padding: '14px 28px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  textDecoration: 'none',
                  display: 'inline-block',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s'
                }}>
                  Управление стейкингами
                </Link>
              ) : (
                <Link to="/login" style={{
                  backgroundColor: 'white',
                  color: '#6c63ff',
                  padding: '14px 28px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  textDecoration: 'none',
                  display: 'inline-block',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s'
                }}>
                  Начать стейкинг
                </Link>
              )}
              
              <Link to="/tokens" style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'white',
                padding: '14px 28px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '1.1rem',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'all 0.2s'
              }}>
                Доступные токены
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div style={{
          position: 'absolute',
          bottom: '-20px',
          left: 0,
          right: 0,
          height: '120px',
          background: 'white',
          borderTopLeftRadius: '50% 70%',
          borderTopRightRadius: '50% 70%',
          zIndex: 1
        }}></div>
        
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)'
        }}></div>
        
        <div style={{
          position: 'absolute',
          bottom: '100px',
          right: '10%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)'
        }}></div>
      </section>

      {/* Features Section */}
      <section className="container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        <h2 style={{ 
          textAlign: 'center', 
          fontSize: '2rem', 
          fontWeight: '700',
          marginBottom: '50px',
          color: '#333'
        }}>
          Почему выбирают нашу платформу
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px'
        }}>
          <div style={{
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            background: 'white',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <SecurityIcon />
            </div>
            <h3 style={{ margin: '0 0 15px', fontSize: '1.4rem', fontWeight: '600', color: '#333' }}>
              Безопасность
            </h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Все операции защищены современными криптографическими методами. Вам не нужно беспокоиться о безопасности ваших активов.
            </p>
          </div>
          
          <div style={{
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            background: 'white',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <FlexibilityIcon />
            </div>
            <h3 style={{ margin: '0 0 15px', fontSize: '1.4rem', fontWeight: '600', color: '#333' }}>
              Гибкость
            </h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Поддержка различных токенов и сетей. Выбирайте активы с лучшими условиями или те, в которые вы верите.
            </p>
          </div>
          
          <div style={{
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            background: 'white',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <TransparencyIcon />
            </div>
            <h3 style={{ margin: '0 0 15px', fontSize: '1.4rem', fontWeight: '600', color: '#333' }}>
              Прозрачность
            </h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Полное отслеживание ваших стейкингов и вознаграждений. Вы всегда знаете, что происходит с вашими активами.
            </p>
          </div>
          
          <div style={{
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            background: 'white',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <RewardIcon />
            </div>
            <h3 style={{ margin: '0 0 15px', fontSize: '1.4rem', fontWeight: '600', color: '#333' }}>
              Вознаграждения
            </h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Получайте стабильное вознаграждение за ваш вклад в поддержание работы блокчейна. Увеличивайте свои активы.
            </p>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section style={{ 
        background: '#f9fafc',
        padding: '80px 0',
        position: 'relative'
      }}>
        <div className="container">
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '2rem', 
            fontWeight: '700',
            marginBottom: '50px',
            color: '#333'
          }}>
            Как начать стейкинг
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '30px'
          }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              textAlign: 'center'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: '#6c63ff',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '20px'
              }}>1</div>
              <h3 style={{ margin: '0 0 15px', fontSize: '1.3rem', fontWeight: '600', color: '#333' }}>
                Подключите кошелек
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                Войдите через Trust Wallet или Tonkeeper для безопасной аутентификации на платформе.
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              textAlign: 'center'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: '#6c63ff',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '20px'
              }}>2</div>
              <h3 style={{ margin: '0 0 15px', fontSize: '1.3rem', fontWeight: '600', color: '#333' }}>
                Выберите токен
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                Изучите доступные токены и выберите тот, который соответствует вашей стратегии.
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              textAlign: 'center'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: '#6c63ff',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '20px'
              }}>3</div>
              <h3 style={{ margin: '0 0 15px', fontSize: '1.3rem', fontWeight: '600', color: '#333' }}>
                Создайте стейкинг
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                Укажите количество токенов для стейкинга и подтвердите операцию через ваш кошелек.
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              textAlign: 'center'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: '#6c63ff',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '20px'
              }}>4</div>
              <h3 style={{ margin: '0 0 15px', fontSize: '1.3rem', fontWeight: '600', color: '#333' }}>
                Получайте вознаграждения
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                Отслеживайте свои стейкинги и получайте вознаграждения на вашем дашборде.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, #6c63ff, #3b5998)',
        color: 'white',
        padding: '80px 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <h2 style={{ 
            fontSize: '2.2rem', 
            fontWeight: '700',
            marginBottom: '20px'
          }}>
            Готовы начать зарабатывать на стейкинге?
          </h2>
          
          <p style={{ 
            fontSize: '1.2rem', 
            opacity: '0.9',
            maxWidth: '700px',
            margin: '0 auto 30px'
          }}>
            Присоединяйтесь к тысячам пользователей, которые уже увеличивают свои активы через стейкинг.
          </p>
          
          <div>
            {isAuthenticated ? (
              <Link to="/staking" style={{
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
                Управление стейкингами
              </Link>
            ) : (
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
                Начать стейкинг
              </Link>
            )}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer style={{ 
        background: '#1f2937',
        color: 'white',
        padding: '60px 0 30px'
      }}>
        <div className="container">
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px',
            marginBottom: '40px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '20px' }}>
                Staking Platform
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.6', marginBottom: '20px' }}>
                Безопасная и удобная платформа для стейкинга криптовалют и получения пассивного дохода.
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '10px' }}>Продукты</h3>
              <button 
                onClick={() => {}} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: 0, 
                  color: '#9ca3af', 
                  textDecoration: 'none', 
                  transition: 'color 0.2s',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                Стейкинг
              </button>
              <button 
                onClick={() => {}} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: 0, 
                  color: '#9ca3af', 
                  textDecoration: 'none', 
                  transition: 'color 0.2s',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                Токены
              </button>
              <button 
                onClick={() => {}} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: 0, 
                  color: '#9ca3af', 
                  textDecoration: 'none', 
                  transition: 'color 0.2s',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                Кошельки
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '10px' }}>Компания</h3>
              <button 
                onClick={() => {}} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: 0, 
                  color: '#9ca3af', 
                  textDecoration: 'none', 
                  transition: 'color 0.2s',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                О нас
              </button>
              <button 
                onClick={() => {}} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: 0, 
                  color: '#9ca3af', 
                  textDecoration: 'none', 
                  transition: 'color 0.2s',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                Карьера
              </button>
              <button 
                onClick={() => {}} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: 0, 
                  color: '#9ca3af', 
                  textDecoration: 'none', 
                  transition: 'color 0.2s',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                Блог
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '10px' }}>Поддержка</h3>
              <button 
                onClick={() => {}} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: 0, 
                  color: '#9ca3af', 
                  textDecoration: 'none', 
                  transition: 'color 0.2s',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                Помощь
              </button>
              <button 
                onClick={() => {}} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: 0, 
                  color: '#9ca3af', 
                  textDecoration: 'none', 
                  transition: 'color 0.2s',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                Контакты
              </button>
            </div>
          </div>
          
          <div style={{ 
            borderTop: '1px solid #374151',
            paddingTop: '20px',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '0.9rem'
          }}>
            <p>© 2023 Staking Platform. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 