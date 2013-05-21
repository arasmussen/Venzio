// Copyright (c) Venzio 2013 All Rights Reserved

var requirejs = require('requirejs');

requirejs.config({
  nodeRequire: require,
  baseUrl: __dirname + '/../..',
  paths: {
    server: 'server/socket',
    common: 'root/common'
  }
});

requirejs(['server/server'], function(server) {
  process.chdir(__dirname);
  server.main();
});
