var requirejs = require('requirejs');

requirejs.config({
  nodeRequire: require,
  baseUrl: '..',
  paths: {
    client: 'webroot/client',
    server: 'server',
    shared: 'webroot/shared'
  }
});

requirejs(['server/server'], function(server) {
  server.main();
});
