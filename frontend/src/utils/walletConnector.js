/**
 * Wallet Connector Utility
 * 
 * Provides functions to connect to different cryptocurrency wallets
 * Currently supports Trust Wallet and Tonkeeper
 */

// Detect if the device is mobile
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Check if Web3 provider is available
const isWeb3Available = () => {
  return typeof window.ethereum !== 'undefined';
};

// Check if Trust Wallet extension is available
const isTrustWalletAvailable = () => {
  if (!isWeb3Available()) {
    return false;
  }
  
  // Trust Wallet can be detected in several ways
  // 1. Check if window.ethereum.isTrust is true
  // 2. Check if window.ethereum.isTrustWallet is true
  // 3. Check if window.trustwallet exists
  // 4. Check provider name/info in ethereum object
  
  if (window.ethereum.isTrust || window.ethereum.isTrustWallet) {
    return true;
  }
  
  if (window.trustwallet) {
    return true;
  }
  
  // Sometimes the Trust Wallet extension doesn't set the isTrust flag correctly
  // So we also check the provider name
  try {
    if (window.ethereum.providerMap && 
        Object.values(window.ethereum.providerMap).some(
          provider => provider.name && provider.name.toLowerCase().includes('trust')
        )) {
      return true;
    }
    
    // Check provider info if available
    if (window.ethereum.providers) {
      for (const provider of window.ethereum.providers) {
        if (provider.isTrust || provider.isTrustWallet || 
           (provider.name && provider.name.toLowerCase().includes('trust'))) {
          return true;
        }
      }
    }
    
    // Check for isMetaMask but actual Trust Wallet
    // Some Trust Wallet extensions identify as MetaMask
    if (window.ethereum.isMetaMask && window.ethereum._metamask && 
        window.ethereum._metamask.hasOwnProperty('_state') && 
        Object.keys(window._metamask).some(k => k.toLowerCase().includes('trust'))) {
      return true;
    }
  } catch (error) {
    console.log("Error checking for Trust Wallet:", error);
  }
  
  return false;
};

// Check if TON Connect is available
const isTonConnectAvailable = () => {
  // Check for both TonConnect global object and tonkeeper-specific window.ton object
  return typeof window.TonConnect !== 'undefined' || 
         (typeof window.ton !== 'undefined' && window.ton.isTonkeeper);
};

// Open Trust Wallet app on mobile with deep link
const openTrustWalletApp = (network) => {
  const deepLink = network === 'ETH' 
    ? 'trust://open_url?url=https://link.trustwallet.com/open_url?coin=60&url=CALLBACK_URL'
    : 'trust://open_url?url=https://link.trustwallet.com/open_url?coin=607&url=CALLBACK_URL';
  
  window.location.href = deepLink;
  return true;
};

// Open Tonkeeper app on mobile with deep link
const openTonkeeperApp = () => {
  // Tonkeeper deep link format
  const deepLink = 'tonkeeper://ton_connect?v=2&r=CALLBACK_URL';
  
  window.location.href = deepLink;
  return true;
};

// Check if Tonkeeper extension is installed but not initialized
const isTonkeeperExtensionInstalled = () => {
  // Check for Tonkeeper extension meta tag
  return document.querySelector('head meta[name="tonkeeper-extension"]') !== null;
};

// Debug function to log information about available providers
const debugProviders = () => {
  const debug = {
    hasEthereum: typeof window.ethereum !== 'undefined',
    hasTrustWallet: typeof window.trustwallet !== 'undefined',
    detectedAsTrustWallet: isTrustWalletAvailable(),
  };
  
  if (debug.hasEthereum) {
    debug.ethereumFlags = {
      isTrust: !!window.ethereum.isTrust,
      isTrustWallet: !!window.ethereum.isTrustWallet,
      isMetaMask: !!window.ethereum.isMetaMask,
      hasProviders: !!window.ethereum.providers,
      hasProviderMap: !!window.ethereum.providerMap,
    };
    
    if (window.ethereum.providers) {
      debug.providersInfo = window.ethereum.providers.map(p => ({
        isTrust: !!p.isTrust,
        isTrustWallet: !!p.isTrustWallet,
        isMetaMask: !!p.isMetaMask,
        name: p.name || 'unknown'
      }));
    }
  }
  
  console.log('Web3 Provider Debug Info:', debug);
  return debug;
};

// Generate a more professional signing message
const generateSigningMessage = (address, walletType) => {
  const timestamp = new Date().toISOString();
  const randomId = Math.random().toString(36).substring(2, 10);
  
  return `Welcome to Staking Platform!

I confirm that I am the owner of wallet address: ${address}
Signing with: ${walletType}
Request ID: ${randomId}
Timestamp: ${timestamp}

This signature will be used only for authentication and does not authorize any transfers or contract interactions.`;
};

/**
 * Connect to Trust Wallet for Ethereum
 * @returns {Promise<{address: string, signature: string}>} Wallet address and signature
 */
export const connectTrustWalletEth = async () => {
  try {
    // Debug available providers
    debugProviders();
    
    // If on mobile, open the Trust Wallet app
    if (isMobile()) {
      openTrustWalletApp('ETH');
      throw new Error('Opening Trust Wallet app. Please complete the connection in the app.');
    }
    
    // On desktop, use the browser extension
    if (!isWeb3Available()) {
      // Trust Wallet extension is not available
      window.open('https://trustwallet.com/browser-extension', '_blank');
      throw new Error('Trust Wallet extension not detected. We opened a page where you can install it.');
    }

    // Check if Trust Wallet is installed
    const isTrustWallet = isTrustWalletAvailable();
    if (!isTrustWallet) {
      // Show message that only Trust Wallet is supported
      if (window.confirm('Only Trust Wallet is supported. Would you like to install it?')) {
        window.open('https://trustwallet.com/browser-extension', '_blank');
      }
      throw new Error('Please use Trust Wallet extension.');
    }

    console.log("Trust Wallet extension detected!");
    
    // If there are multiple providers, try to select Trust Wallet
    let provider = window.ethereum;
    
    // Try to choose Trust Wallet from providers if available
    if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
      console.log("Multiple providers detected, trying to find Trust Wallet...");
      
      for (const p of window.ethereum.providers) {
        if (p.isTrust || p.isTrustWallet || 
           (p.name && p.name.toLowerCase().includes('trust'))) {
          console.log("Found Trust Wallet provider:", p);
          provider = p;
          break;
        }
      }
    }
    
    try {
      // Request account access using the selected provider
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];

      // Generate and sign a professional message for authentication
      const message = generateSigningMessage(address, 'Trust Wallet');
      
      try {
        const signature = await provider.request({
          method: 'personal_sign',
          params: [message, address],
        });

        console.log('Trust Wallet ETH Connected:', { address, signature });
        return { address, signature, message };
      } catch (signingError) {
        console.error("Error during message signing:", signingError);
        
        // Check if user rejected the signature
        if (signingError.code === 4001) {
          throw new Error("Вы отклонили запрос на подпись. Для входа необходимо подписать сообщение.");
        }
        
        // Check for common provider errors
        if (signingError.code === -32603) {
          throw new Error("Внутренняя ошибка провайдера. Попробуйте перезагрузить страницу.");
        }
        
        throw signingError;
      }
    } catch (innerError) {
      console.error("Error using selected provider:", innerError);
      
      // Fallback to window.ethereum if provider-specific request failed
      if (provider !== window.ethereum) {
        console.log("Trying to use window.ethereum as fallback...");
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const address = accounts[0];
          
          const message = generateSigningMessage(address, 'Trust Wallet');
          const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [message, address],
          });
          
          console.log('Connected with fallback provider:', { address, signature });
          return { address, signature, message };
        } catch (fallbackError) {
          console.error("Fallback provider also failed:", fallbackError);
          throw fallbackError;
        }
      }
      
      throw innerError;
    }
  } catch (error) {
    console.error('Trust Wallet connection error:', error);
    throw error;
  }
};

/**
 * Connect to Trust Wallet for TON
 * @returns {Promise<{address: string, signature: string}>} Wallet address and signature
 */
export const connectTrustWalletTon = async () => {
  try {
    // Debug available providers
    debugProviders();
    
    // If on mobile, open the Trust Wallet app
    if (isMobile()) {
      openTrustWalletApp('TON');
      throw new Error('Opening Trust Wallet app. Please complete the connection in the app.');
    }
    
    // On desktop, use TON Connect
    if (!isTonConnectAvailable()) {
      // Open Trust Wallet download page
      window.open('https://trustwallet.com/browser-extension', '_blank');
      throw new Error('Trust Wallet extension not detected. We opened a page where you can install it.');
    }

    // Create TON Connect instance
    const tonConnect = new window.TonConnect();
    
    // Connect to wallet
    await tonConnect.connect({
      manifestUrl: window.location.origin + '/tonconnect-manifest.json',
      walletList: ['trust-wallet']  // specifically target Trust Wallet
    });
    
    // Get the connected wallet
    const wallet = tonConnect.wallet;
    
    if (!wallet) {
      throw new Error('Failed to connect to Trust Wallet TON');
    }
    
    const address = wallet.address;
    
    // Generate professional message for authentication
    const message = generateSigningMessage(address, 'Trust Wallet (TON)');
    const signature = await tonConnect.signMessage(message);

    console.log('Trust Wallet TON Connected:', { address, signature });
    return { address, signature, message };
  } catch (error) {
    console.error('Trust Wallet TON connection error:', error);
    throw error;
  }
};

/**
 * Connect to Tonkeeper
 * @returns {Promise<{address: string, signature: string}>} Wallet address and signature
 */
export const connectTonkeeper = async () => {
  try {
    // Debug available providers
    debugProviders();
    
    // First, check if Tonkeeper extension is installed
    let hasTonkeeperExtension = typeof window.ton !== 'undefined' && window.ton.isTonkeeper;
    const hasTonConnect = typeof window.TonConnect !== 'undefined';
    const extensionInstalled = isTonkeeperExtensionInstalled();
    
    console.log('Tonkeeper extension detected:', hasTonkeeperExtension);
    console.log('TonConnect available:', hasTonConnect);
    console.log('Tonkeeper extension installed but not initialized:', extensionInstalled && !hasTonkeeperExtension);
    
    // If on mobile, open Tonkeeper app
    if (isMobile()) {
      openTonkeeperApp();
      throw new Error('Opening Tonkeeper app. Please complete the connection in the app.');
    }
    
    // Попытка активировать расширение напрямую
    if (extensionInstalled && !hasTonkeeperExtension) {
      // Пробуем активировать расширение через протокол tonkeeper://
      try {
        console.log('Trying to activate Tonkeeper extension directly');
        window.location.href = 'tonkeeper://';
        
        // Ждем немного, чтобы расширение активировалось
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Проверяем, активировалось ли расширение
        if (typeof window.ton !== 'undefined' && window.ton.isTonkeeper) {
          console.log('Tonkeeper extension activated successfully');
          // Обновляем флаг
          hasTonkeeperExtension = true;
        } else {
          console.log('Failed to activate Tonkeeper extension directly');
        }
      } catch (e) {
        console.error('Error activating Tonkeeper extension:', e);
      }
    }
    
    // On desktop, try to use the extension directly
    if (!hasTonkeeperExtension && !hasTonConnect) {
      // Check if extension is installed but not initialized
      if (extensionInstalled) {
        console.log('Tonkeeper extension installed but not initialized');
        // Wait a moment and try again
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check again after waiting
        if (typeof window.ton !== 'undefined' && window.ton.isTonkeeper) {
          console.log('Tonkeeper extension initialized after waiting');
        } else {
          // Extension exists but not responding, prompt user to open it
          const userResponse = confirm('Расширение Tonkeeper установлено, но не активировано. Хотите открыть страницу расширений Chrome для его активации?');
          
          if (userResponse) {
            // Попытка активировать расширение через chrome://extensions
            try {
              // Открываем страницу расширений Chrome
              window.open('chrome://extensions/?id=omaabbefbmiijedngplfjmnooppbclkk', '_blank');
              alert('Пожалуйста, активируйте расширение Tonkeeper на странице расширений Chrome, затем вернитесь на эту страницу и попробуйте снова.');
            } catch (e) {
              console.error('Failed to open extensions page:', e);
              // Если не удалось открыть chrome://extensions, пробуем открыть страницу расширений
              window.open('chrome://extensions/', '_blank');
              alert('Пожалуйста, найдите и активируйте расширение Tonkeeper на странице расширений Chrome, затем вернитесь на эту страницу и попробуйте снова.');
            }
          }
          
          return null;
        }
      } else {
        // Extension not installed, open Chrome Web Store directly
        const userResponse = confirm('Расширение Tonkeeper не установлено. Хотите установить его сейчас?');
        
        if (userResponse) {
          window.open('https://chromewebstore.google.com/detail/tonkeeper-%E2%80%94-wallet-for-to/omaabbefbmiijedngplfjmnooppbclkk', '_blank');
          alert('После установки расширения, пожалуйста, обновите эту страницу и попробуйте снова.');
        }
        
        throw new Error('Расширение Tonkeeper не обнаружено. Установите расширение и попробуйте снова.');
      }
    }
    
    // Try to use direct Tonkeeper API first
    let wallet = null;
    let tonConnect = null;
    
    if (hasTonkeeperExtension) {
      console.log('Using direct Tonkeeper API');
      try {
        // Request wallet access
        await window.ton.requestWallets();
        wallet = { address: window.ton.address };
        console.log('Connected to Tonkeeper via direct API:', wallet);
      } catch (e) {
        console.error('Error connecting to Tonkeeper directly:', e);
        // Fall back to TonConnect
      }
    }
    
    // If direct API failed, try TonConnect
    if (!wallet && hasTonConnect) {
      console.log('Using TonConnect API');
      try {
        tonConnect = new window.TonConnect();
        
        // Connect to wallet with specific parameters to target Tonkeeper
        await tonConnect.connect({
          manifestUrl: window.location.origin + '/tonconnect-manifest.json',
          walletList: ['tonkeeper']  // specifically target Tonkeeper
        });
        
        // Get the connected wallet
        wallet = tonConnect.wallet;
        console.log('Connected to Tonkeeper via TonConnect:', wallet);
      } catch (e) {
        console.error('Error connecting via TonConnect:', e);
      }
    }
    
    if (!wallet) {
      throw new Error('Не удалось подключиться к Tonkeeper. Пожалуйста, убедитесь, что расширение установлено и активировано.');
    }
    
    const address = wallet.address;
    
    // Generate a professional message for authentication
    const message = generateSigningMessage(address, 'Tonkeeper');
    
    // Sign message using the appropriate method
    let signature;
    if (hasTonkeeperExtension && window.ton.signMessage) {
      signature = await window.ton.signMessage(message);
    } else if (tonConnect) {
      signature = await tonConnect.signMessage(message);
    } else {
      throw new Error('Нет доступного метода для подписи сообщения');
    }

    console.log('Tonkeeper Connected:', { address, signature });
    return { address, signature, message };
  } catch (error) {
    console.error('Tonkeeper connection error:', error);
    throw error;
  }
};

/**
 * Connect to a specified wallet
 * @param {string} networkType 'ETH' or 'TON'
 * @param {string} walletType 'Trust Wallet' or 'Tonkeeper'
 * @returns {Promise<{address: string, signature: string}>} Wallet address and signature
 */
export const connectWallet = async (networkType, walletType) => {
  if (networkType === 'ETH') {
    if (walletType === 'Trust Wallet') {
      return await connectTrustWalletEth();
    } else {
      throw new Error('Only Trust Wallet is supported for Ethereum network');
    }
  } else if (networkType === 'TON') {
    if (walletType === 'Trust Wallet') {
      return await connectTrustWalletTon();
    } else if (walletType === 'Tonkeeper') {
      return await connectTonkeeper();
    } else {
      throw new Error('Unsupported wallet type for TON network');
    }
  } else {
    throw new Error('Unsupported network type');
  }
}; 