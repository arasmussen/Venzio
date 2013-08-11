// Copyright (c) Venzio 2013 All Rights Reserved

var requirejs = require('requirejs');

requirejs.config({
  nodeRequire: require,
  baseUrl: __dirname + '/../..',
  paths: {
    web: 'server/web',
    model: 'server/model',
    db: 'server/db/db',
    endpoint: 'server/endpoint',
  }
});

requirejs([
    'db',
    'http',
    'web/request',
  ],
  function(db, http, request) {
    db.connect();

    http.createServer(function(req, res) {
      var r = new request(req, res, processRequest);
    }).listen(8001);

    function processRequest(request) {
      var uri = request.getURI();

      // if it's a special keyword then call that function
      if (request.config.endpoints.hasOwnProperty(uri)) {
        var handler = new request.config.endpoints[uri](request);
        handler.handle();
        return;
      }

      // if it's an alias then change the uri
      if (request.config.aliases.hasOwnProperty(uri)) {
        request.setURI(request.config.aliases[uri]);
      }

      // if it's a redirect then send the 302
      if (request.config.redirects.hasOwnProperty(uri)) {
        request.respond302(request.config.redirects[uri]);
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
