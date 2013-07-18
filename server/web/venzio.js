// Copyright (c) Venzio 2013 All Rights Reserved

var requirejs = require('requirejs');

requirejs.config({
  nodeRequire: require,
  baseUrl: __dirname + '/../..',
  paths: {
    web: 'server/web',
    common: 'root/common',
    model: 'server/model',
    db: 'server/db/db',
    endpoint: 'server/endpoint'
  }
});

requirejs([
    'db',
    'http',
    'web/request',
    'web/config'
  ],
  function(db, http, request, config) {
    db.connect();

    http.createServer(function(req, res) {
      var r = new request(req, res, processRequest);
    }).listen(8001);

    function processRequest(request) {
      var uri = request.getURI();

      // if it's a special keyword then call that function
      if (config.endpoints.hasOwnProperty(uri)) {
        var handler = new config.endpoints[uri](request);
        handler.handle();
        return;
      }

      // if it's an alias then change the uri
      if (config.aliases.hasOwnProperty(uri)) {
        request.setURI(config.aliases[uri]);
      }

      // if it's a redirect then send the 302
      if (config.redirects.hasOwnProperty(uri)) {
        request.respond302(config.redirects[uri]);
        return;
      }

      // make sure the uri is valid and inside the webroot
      if (!request.isValidURI()) {
        request.respond404();
        return;
      }

      request.serveFile();
    }
  }
);
