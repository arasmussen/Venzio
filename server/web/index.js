// Copyright (c) Venzio 2013 All Rights Reserved

var requirejs = require('requirejs');

requirejs.config({
  nodeRequire: require,
  baseUrl: __dirname + '/../..',
  paths: {
    server: 'server/web',
    common: 'root/common'
  }
});

requirejs([
    'fs',
    'http',
    'server/HeightmapRequestHandler'
  ],
  function(fs, http, HeightmapRequestHandler) {
    var webroot = __dirname + '/../../root';

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
      '/heightmap': HeightmapRequestHandler
    };

    var redirects = {
      '/': '/index.html'
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
      var url = getFilepath(request.url);

      // if it's a special keyword then call that function
      if (keywords.hasOwnProperty(url)) {
        var handler = new keywords[url](request, response);
        handler.handle();
        return;
      }

      // if it's a redirect then fix the url
      if (redirects.hasOwnProperty(url)) {
        url = redirects[url];
      }

      // if the file doesn't exist return a 404
      var filepath = webroot + url;
      if (!fs.existsSync(filepath)) {
        response.writeHead(404);
        response.end();
        return;
      }

      // otherwise just serve that file. this is probably a huge security issue
      // (for example if the user somehow requests http://venz.io/../../../../../etc/passwd)
      var extension = getExtension(url);
      response.writeHead(200, {'Content-Type': extension.contentType});
      var contents = fs.readFileSync(filepath, extension.binary ? 'binary' : 'utf8');
      response.end(contents, extension.binary ? 'binary' : 'utf8');
    }).listen(8001);
  }
);
