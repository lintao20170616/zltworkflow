module.exports = (app) => {
  app.beforeStart(async () => {
    app.logger.info('[egg-oauth] plugin loaded');
  });
};
