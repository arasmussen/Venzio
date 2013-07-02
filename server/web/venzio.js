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
    'endpoint/Heightmap',
    'endpoint/Payment',
    'endpoint/PlayerLogin',
    'endpoint/CreatePlayer',
    'endpoint/Logout',
    'model/player'
  ],
  function(db, ejs, fs, http, HeightmapEndpoint, PaymentEndpoint, LoginPlayerEndpoint, CreatePlayerEndpoint, LogoutEndpoint, playerModel) {
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
      '/logout': LogoutEndpoint
    };

    var aliases = {
    //  '/': '/index',
    };

    var redirects = {
      '/': '/developers'
    };

    function getExtension(url) {
      var lastDot = url.lastIndexOf('.') + 1;
      var questionMark = url.indexOf('?');
      if (questionMark != -1) {
        var extension = url.substr(lastDot, questionMark - lastDot);
      } else {
        var extension = url.substr(lastDot);
      }
      return extensions[extension] || extensions['other'];
    }

    function getFilepath(url) {
      if (url.indexOf('?') == -1) {
        return url;
      }
      // strip get params if there are any
      return url.substr(0, url.indexOf('?'));
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
      var url = getFilepath(request.url);

      // if it's a special keyword then call that function
      if (keywords.hasOwnProperty(url)) {
        var handler = new keywords[url](request, response, player);
        handler.handle();
        return;
      }

      // if it's an alias then fix the url
      if (aliases.hasOwnProperty(url)) {
        url = aliases[url];
      }

      if (redirects.hasOwnProperty(url)) {
        response.writeHead(302, {
          'Content-Type': 'text/plain',
          'Location': redirects[url]
        });
        response.end();
        return;
      }

      var filepath = webroot + url;
      var extension;
      if (fs.existsSync(filepath)) {
        var extension = getExtension(url);
        var contents = fs.readFileSync(filepath, extension.binary ? 'binary' : 'utf8');
      } else if (fs.existsSync(filepath + '.html')) {
        var extension = extensions['html'];
        var data = {
          is_game: (url == '/demo'),
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
          is_game: (url == '/demo'),
          player: player
        };
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
