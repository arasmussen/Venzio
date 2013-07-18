// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'ejs',
    'fs',
    'url',
    'server/cache'
  ],
  function(Base, ejs, fs, url, cache) {

    var extensions = {
      'html': {contentType: 'text/html', encoding: 'utf8'},
      'css': {contentType: 'text/css', encoding: 'utf8'},
      'js': {contentType: 'application/javascript', encoding: 'utf8'},
      'gif': {contentType: 'image/gif', encoding: 'binary'},
      'jpeg': {contentType: 'image/jpeg', encoding: 'binary'},
      'jpg': {contentType: 'image/jpeg', encoding: 'binary'},
      'png': {contentType: 'image/png', encoding: 'binary'},
      'ico': {contentType: 'image/x-icon', encoding: 'binary'},
      'other': {contentType: 'text/plain', encoding: 'utf8'}
    };

    var headerFile = __dirname + '/../template/header.html.ejs';
    var footerFile = __dirname + '/../template/footer.html';
    var fourOhFourFile = __dirname + '/../template/404.html';

    var webroot = __dirname + '/../../root';

    return Base.extend({
      constructor: function(request, response, readyCallback) {
        this.request = request;
        this.response = response;
        this.readyCallback = readyCallback;

        // parse cookies
        this.cookies = {};
        if (request.headers.cookie) {
          request.headers.cookie.split(';').forEach(function(cookie) {
            var parts = cookie.split('=');
            this.cookies[parts[0].trim()] = (parts[1] || '').trim();
          });
        }

        // see if there's some kind of user logged in
        if (this.cookies.hasOwnProperty('sessid')) {
          playerModel.playerFromSessID(this.cookies['sessid'], this.ready.bind(this));
        } else {
          this.ready(null);
        }
      },

      ready: function(user) {
        if (user) {
          this.user = user;
        }
        this.readyCallback(this);
      },

      respond200: function() {
        var filepath = webroot + uri;
        var extension = getExtension(uri);
        var html = false;
        var ejs = false;

        if (fs.existsSync(filepath + '.html')) {
          filepath = filepath + '.html';
          html = true;
        } else if (fs.existsSync(filepath + '.html.ejs')) {
          filepath = filepath + '.html.ejs';
          ejs = true;
        }

        cache.getFile(filepath, extension.encoding, function(err, contents) {
          if (err) {
            this.respond404();
            return;
          }

          if (html) {
            var header = this.getHeader();
            var footer = this.getFooter();

            contents = header + contents + footer;
          } else if (ejs) {
            var header = this.getHeader();
            var footer = this.getFooter();

            var ejsData = this.getEJSData();
            var uriParams = url.parse(this.request.url, true).query;
            for (var key in uriParams) {
              data[key] = uriParams[key];
            }

            contents = ejs.render(contents, this.getEJSData());
            contents = header + contents + footer;
          }

          response.writeHead(200, {'Content-Type': extension.contentType});
          response.end(contents, extension.encoding);
        }.bind(this));
      },

      respond302: function(location) {
        response.writeHead(302, {
          'Content-Type': 'text/plain',
          'Location': location
        });
        response.end();
      },

      respond404: function() {
        var extension = extensions['html'];
        var contents = this.getHeader() + this.get404Page() + this.getFooter();
        response.writeHead(404, {'Content-Type': 'text/html'});
        response.end(contents, 'utf8');
      },

      isValidURI: function() {
        var filepath = webroot + this.getURI();
        var realpath;

        if (fs.existsSync(filepath)) {
          realpath = fs.realpathSync(filepath);
        } else if (fs.existsSync(filepath + '.html')) {
          realpath = fs.realpathSync(filepath + '.html');
        } else if (fs.existsSync(filepath + '.html.ejs')) {
          realpath = fs.realpathSync(filepath + '.html.ejs');
        } else {
          return false;
        }

        var webroot = fs.realpathSync(webroot);
        if (!(realpath.indexOf(webroot) == 0)) {
          return false;
        }

        return true;
      },

      getHeader: function() {
        var headerTemplate = cache.getFile(headerFile);
        return ejs.render(headerTemplate, this.getEJSData());
      },

      getFooter: function() {
        return cache.getFile(footerFile);
      },

      get404Page: function() {
        return cache.getFile(fourOhFourFile);
      },

      getEJSData: function() {
        var uri = this.getURI();
        return {
          cssFiles: config.cssFiles[uri] || [],
          is_game: (uri == '/demo'),
          user: this.user,
          uri: uri
        };
      },

      getExtension: function() {
        var uri = this.getURI();
        var lastDot = uri.lastIndexOf('.') + 1;
        var questionMark = uri.indexOf('?');
        if (questionMark != -1) {
          var extension = uri.substr(lastDot, questionMark - lastDot);
        } else {
          var extension = uri.substr(lastDot);
        }
        if (extension == 'ejs') {
          extension = 'html';
        }
        return extensions[extension] || extensions['other'];
      },

      getURI: function() {
        var uri = this.request.uri;
        if (uri.indexOf('?') == -1) {
          return uri;
        }
        // strip get params if there are any
        return uri.substr(0, uri.indexOf('?'));
      }
    });
  }
);
