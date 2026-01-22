module.exports = (app) => {
  try {
    const config = app.config.ollama || {};
    if (!config.enabled) {
      app.logger.info('[egg-ollama] plugin disabled');
      return;
    }
    app.logger.info('[egg-ollama] plugin enabled');
  } catch (error) {
    app.logger.error('[egg-ollama] plugin initialization error:', error);
  }
};
