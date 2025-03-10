const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    ['/staking', '/tokens', '/users', '/wallets'],
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.log('Proxy Error:', err);
        res.status(500).send('Proxy Error');
      }
    })
  );
}; 