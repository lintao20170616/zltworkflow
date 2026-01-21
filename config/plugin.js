const path = require('path');

module.exports = {
  eggViewNunjucks: {
    enable: true,
    package: 'egg-view-nunjucks',
  },
  sequelize: {
    enable: true,
    package: 'egg-sequelize',
  },
  oauth: {
    enable: true,
    path: path.join(__dirname, '../app/lib/plugin/oauth'),
  },
  redis: {
    enable: true,
    package: 'egg-redis',
  },
  sessionRedis: {
    enable: true,
    package: 'egg-session-redis',
  },
  ollama: {
    enable: true,
    path: path.join(__dirname, '../app/lib/plugin/ollama'),
  },
};
