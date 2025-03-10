import axios from 'axios';

// Create an API instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 10000, // 10 seconds timeout
  withCredentials: true, // Include cookies
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor
api.interceptors.request.use(
  config => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add a response interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Network errors don't have response
    if (!error.response) {
      console.error('Network Error:', error);
      return Promise.reject({
        ...error,
        message: 'Network Error: Unable to connect to the server'
      });
    }
    
    // Handle 401 Unauthorized
    if (error.response.status === 401 && !originalRequest._retry) {
      // If token expired and we have a refresh mechanism, we can implement it here
      // For now, just log the user out if they're unauthorized
      if (localStorage.getItem('token')) {
        console.warn('Unauthorized access with token, logging out...');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API для аутентификации
export const authApi = {
  login: (address, network, signature, wallet_type) => {
    console.log(`Login attempt: address=${address}, network=${network}, wallet_type=${wallet_type}`);
    return api.post('/users/login', { 
      address, 
      network, 
      signature,
      wallet_type 
    }).catch(error => {
      if (!error.response) {
        console.error('Network error during login:', error);
      } else {
        console.error('Login error:', error.response?.data || error.message);
      }
      throw error;
    });
  },
  logout: () => api.post('/users/logout'),
  getCurrentUser: () => api.get('/users/me'),
  testAuth: () => api.get('/users/test-auth')
};

// API для стейкинга
export const stakingApi = {
  getStakingList: () => {
    console.log('Requesting staking list');
    return api.get('/staking')
      .then(response => {
        console.log('Received staking list response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Error fetching staking list:', error.response || error.message);
        throw error;
      });
  },
  getStaking: (id) => api.get(`/staking/${id}`),
  stakeTokens: (stakingData) => {
    console.log(`Staking tokens:`, stakingData);
    return api.post('/staking', stakingData)
      .then(response => {
        console.log('Stake tokens response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Error staking tokens:', error.response?.data || error.message);
        throw error;
      });
  },
  requestUnstake: (stakingId) => {
    console.log(`Requesting unstake for staking ID: ${stakingId}`);
    return api.post(`/staking/${stakingId}/unstake`)
      .then(response => {
        console.log(`Unstake response for ${stakingId}:`, response.data);
        return response;
      })
      .catch(error => {
        console.error(`Error requesting unstake for ${stakingId}:`, error.response?.data || error.message);
        throw error;
      });
  },
  getNetworks: () => {
    console.log('Requesting networks list');
    return api.get('/staking/networks')
      .then(response => {
        console.log('Networks response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Error fetching networks:', error.response || error.message);
        throw error;
      });
  },
  getStakingBalance: () => api.get('/staking/balance')
    .catch(error => {
      console.error('Error fetching staking balance:', error.response?.data || error.message);
      throw error;
    })
};

// API для токенов
export const tokensApi = {
  getAllTokens: () => api.get('/tokens'),
  getToken: (id) => api.get(`/tokens/${id}`),
  getTokensByNetwork: (network) => api.get(`/tokens?network=${network}`)
};

export default api; 