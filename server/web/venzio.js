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
    'ejs',
    'fs',
    'http',
    'url',
    'model/player',
    'web/config'
  ],
  function(
    db,
    ejs,
    fs,
    http,
    url,
    playerModel,
    config
  ) {
    db.connect();

    var webroot = __dirname + '/../../root';

    var headerFile = __dirname + '/../template/header.html.ejs';
    var footerFile = __dirname + '/../template/footer.html';

    var fourOhFourFile = __dirname + '/../template/404.html';

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
      if (config.endpoints.hasOwnProperty(uri)) {
        var handler = new config.endpoints[uri](request, response, player);
        handler.handle();
        return;
      }

      // if it's an alias then fix the uri
      if (config.aliases.hasOwnProperty(uri)) {
        uri = config.aliases[uri];
      }

      if (config.redirects.hasOwnProperty(uri)) {
        response.writeHead(302, {
          'Content-Type': 'text/plain',
          'Location': config.redirects[uri]
        });
        response.end();
        return;
      }

      var filepath = webroot + uri;
      var extension = getExtension(uri);
      var data = {
        cssFiles: config.cssFiles[uri] || [],
        is_game: (uri == '/demo'),
        player: player,
        uri: uri
      };
      var header = ejs.render(
        fs.readFileSync(headerFile, 'utf8'),
        data
      );
      var footer = fs.readFileSync(footerFile);

      if (fs.existsSync(filepath) && extension != extensions['html']) {
        var contents = fs.readFileSync(filepath, extension.binary ? 'binary' : 'utf8');
      } else if (fs.existsSync(filepath + '.html')) {
        extension = extensions['html'];
        var contents = fs.readFileSync(filepath + '.html', 'utf8')
        contents = header + contents + footer;
      } else if (fs.existsSync(filepath + '.html.ejs')) {
        extension = extensions['html'];

        uriParams = url.parse(request.url, true).query;
        for (var key in uriParams) {
          data[key] = uriParams[key];
        }

        var contents = ejs.render(
          fs.readFileSync(filepath + '.html.ejs', 'utf8'),
          data
        );
        contents = header + contents + footer;
      } else {
        extension = extensions['html'];
        var contents = fs.readFileSync(fourOhFourFile, 'utf8');
        contents = header + contents + footer;
        response.writeHead(404, {'Content-Type': extension.contentType});
        response.end(contents, 'utf8');
        return;
      }
      response.writeHead(200, {'Content-Type': extension.contentType});
      response.end(contents, extension.binary ? 'binary' : 'utf8');
    }
  }
);
