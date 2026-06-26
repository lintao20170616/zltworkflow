module.exports = () => {
  const config = {};

  config.sequelize = {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  };

  config.redis = {
    client: {
      host: '127.0.0.1',
      port: 6379,
      password: '',
      db: 1,
    },
  };

  config.security = {
    csrf: {
      enable: false,
    },
  };

  return config;
};
