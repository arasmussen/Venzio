// Copyright (c) Venzio 2013 All Rights Reserved

var requirejs = require('requirejs');

requirejs.config({
  nodeRequire: require,
  baseUrl: __dirname + '/../..',
  paths: {
    server: 'server/web',
    common: 'root/common',
    model: 'server/model',
    db: 'server/db/db',
    endpoint: 'server/endpoint'
  }
});

requirejs([
    'db',
    'ejs',
    'fs',
    'http',
    'url',
    'endpoint/Heightmap',
    'endpoint/Payment',
    'endpoint/PlayerLogin',
    'endpoint/CreatePlayer',
    'endpoint/Logout',
    'endpoint/DeveloperSubscribe',
    'model/player'
  ],
  function(db, ejs, fs, http, url, HeightmapEndpoint, PaymentEndpoint, LoginPlayerEndpoint, CreatePlayerEndpoint, LogoutEndpoint, DeveloperSubscribeEndpoint, playerModel) {
    db.connect();

    var webroot = __dirname + '/../../root';

    var headerFile = __dirname + '/../template/header.html.ejs';
    var footerFile = __dirname + '/../template/footer.html';

    var extensions = {
      'html': {contentType: 'text/html', binary: false},
      'css': {contentType: 'text/css', binary: false},
      'js': {contentType: 'application/javascript', binary: false},
      'gif': {contentType: 'image/gif', binary: true},
      'jpeg': {contentType: 'image/jpeg', binary: true},
      'jpg': {contentType: 'image/jpeg', binary: true},
      'png': {contentType: 'image/png', binary: true},
      'ico': {contentType: 'image/x-icon', binary: true},
      'other': {contentType: 'text/plain', binary: false}
    };

    var keywords = {
      '/heightmap': HeightmapEndpoint,
      '/charge': PaymentEndpoint,
      '/playerLogin': LoginPlayerEndpoint,
      '/createPlayer': CreatePlayerEndpoint,
      '/logout': LogoutEndpoint,
      '/developerSubscribe': DeveloperSubscribeEndpoint
    };

    var aliases = {
    //  '/': '/index',
    };

    var redirects = {
      '/': '/developers'
    };

    function getExtension(uri) {
      var lastDot = uri.lastIndexOf('.') + 1;
      var questionMark = uri.indexOf('?');
      if (questionMark != -1) {
        var extension = uri.substr(lastDot, questionMark - lastDot);
      } else {
        var extension = uri.substr(lastDot);
      }
      return extensions[extension] || extensions['other'];
    }

    function getFilepath(uri) {
      if (uri.indexOf('?') == -1) {
        return uri;
      }
      // strip get params if there are any
      return uri.substr(0, uri.indexOf('?'));
    }

    http.createServer(function(request, response) {
      var cookies = {};
      request.headers.cookie && request.headers.cookie.split(';').forEach(function(cookie) {
        var parts = cookie.split('=');
        cookies[parts[0].trim()] = (parts[1] || '').trim();
      });
      if (cookies.hasOwnProperty('sessid')) {
        var callback = processRequest.bind(null, request, response);
        playerModel.playerFromSessID(cookies['sessid'], callback);
      } else {
        processRequest(request, response, null);
      }
    }).listen(8001);

    function processRequest(request, response, player) {
      var uri = getFilepath(request.url);

      // if it's a special keyword then call that function
      if (keywords.hasOwnProperty(uri)) {
        var handler = new keywords[uri](request, response, player);
        handler.handle();
        return;
      }

      // if it's an alias then fix the uri
      if (aliases.hasOwnProperty(uri)) {
        uri = aliases[uri];
      }

      if (redirects.hasOwnProperty(uri)) {
        response.writeHead(302, {
          'Content-Type': 'text/plain',
          'Location': redirects[uri]
        });
        response.end();
        return;
      }

      var filepath = webroot + uri;
      var extension;
      if (fs.existsSync(filepath)) {
        var extension = getExtension(uri);
        var contents = fs.readFileSync(filepath, extension.binary ? 'binary' : 'utf8');
      } else if (fs.existsSync(filepath + '.html')) {
        var extension = extensions['html'];
        var data = {
          is_game: (uri == '/demo'),
          player: player
        };
        var header = ejs.render(
          fs.readFileSync(headerFile, 'utf8'),
          data
        );
        var footer = fs.readFileSync(footerFile);
        var contents = fs.readFileSync(filepath + '.html', 'utf8')
        contents = header + contents + footer;
      } else if (fs.existsSync(filepath + '.html.ejs')) {
        var extension = extensions['html'];
        var data = {
          is_game: (uri == '/demo'),
          player: player
        };

        uriParams = url.parse(request.url, true).query;
        for (var key in uriParams) {
          data[key] = uriParams[key];
        }

        var header = ejs.render(
          fs.readFileSync(headerFile, 'utf8'),
          data
        );
        var footer = fs.readFileSync(footerFile);
        var contents = ejs.render(
          fs.readFileSync(filepath + '.html.ejs', 'utf8'),
          data
        );
        contents = header + contents + footer;
      } else {
        response.writeHead(404);
        response.end();
        return;
      }
      response.writeHead(200, {'Content-Type': extension.contentType});
      response.end(contents, extension.binary ? 'binary' : 'utf8');
    }
  }
);
