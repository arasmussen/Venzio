// Copyright (c) Venzio 2013 All Rights Reserved

var requirejs = require('requirejs');

requirejs.config({
  nodeRequire: require,
  baseUrl: __dirname + '/../..',
  paths: {
    server: 'server/socket',
    shared: 'root/shared'
  }
});

requirejs(['server/server'], function(server) {
  server.main();
});
