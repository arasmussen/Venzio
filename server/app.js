var requirejs = require('requirejs');

requirejs.config({
  nodeRequire: require,
  baseUrl: '..',
  paths: {
    client: 'root/client',
    server: 'server',
    shared: 'root/shared'
  }
});

requirejs(['server/server'], function(server) {
  server.main();
});
