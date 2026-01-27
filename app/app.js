module.exports = (app) => {
  app.once('server', (server) => {
    server.timeout = 600000;
    server.keepAliveTimeout = 600000;
    server.headersTimeout = 600000;
  });
};
