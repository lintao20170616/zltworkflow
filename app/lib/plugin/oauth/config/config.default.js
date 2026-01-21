module.exports = () => {
  const config = {};
  config.oauth = {
    enable: true,
    whitelist: ['/api/user/login', '/api/user/register', '/api/user/logout'],
    userKey: 'user',
  };
  return config;
};
