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
      }
    }).listen(8001);

    function processRequest(request, response, player) {
      var url = getFilepath(request.url);

      // if it's a special keyword then call that function
      if (keywords.hasOwnProperty(url)) {
        var handler = new keywords[url](request, response);
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

      // if the file doesn't exist return a 404
      var filepath = webroot + url;
      if (!fs.existsSync(filepath) && fs.existsSync(filepath + '.html')) {
        filepath += '.html';
        url += '.html';
      } else if (!fs.existsSync(filepath)) {
        response.writeHead(404);
        response.end();
        return;
      }

      // otherwise just serve that file. this is probably a huge security issue
      // (for example if the user somehow requests http://venz.io/../../../../../etc/passwd)
      var extension = getExtension(url);
      response.writeHead(200, {'Content-Type': extension.contentType});
      var contents = fs.readFileSync(filepath, extension.binary ? 'binary' : 'utf8');

      // if it's an html page, add the header and footer templates
      if (extension.contentType == 'text/html') {
        var data = {
          is_game: (url == '/demo.html'),
          player: player
        };

        var header = ejs.render(
          fs.readFileSync(headerFile, 'utf8'),
          data
        );
        var footer = fs.readFileSync(footerFile, 'utf8');
        contents = header + contents + footer;
      }

      response.end(contents, extension.binary ? 'binary' : 'utf8');
    }
  }
);
