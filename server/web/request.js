// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'ejs',
    'fs',
    'module',
    'path',
    'url',
    'model/player',
    'web/cache',
    'web/config'
  ],
  function(Base, ejs, fs, module, path, url, playerModel, cache, config) {

    var __dirname = path.dirname(module.uri);

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
        this.setCookies = {};
        this.webroot = webroot + '/' + this.getSubdomain() + '/';

        // parse cookies
        this.cookies = {};
        if (request.headers.cookie) {
          request.headers.cookie.split(';').forEach(function(cookie) {
            var parts = cookie.split('=');
            this.cookies[parts[0].trim()] = (parts[1] || '').trim();
          }.bind(this));
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

      respond: function(statusCode, headers, contents, encoding) {
        // append set cookies
        if (Object.keys(this.setCookies).length > 0) {
          var cookieString = '';
          for (var key in this.setCookies) {
            var value = this.setCookies[key];
            cookieString += key + '=' + value + ';';
          }
          cookieString += ' HttpOnly';
          headers['Set-Cookie'] = cookieString;
        }

        // write the header
        this.response.writeHead(statusCode, headers);

        // write the response (if there is one)
        if (contents) {
          this.response.end(contents, encoding);
        } else {
          this.response.end();
        }
      },

      respond200: function(contents, contentType, encoding) {
        this.respond(200, {'Content-Type': contentType}, contents, encoding);
      },

      serveFile: function() {
        var uri = this.getURI();
        var filepath = this.webroot + uri;
        var extension = this.getExtension(uri);
        var isHTML = false;
        var isEJS = false;

        if (fs.existsSync(filepath + '.html')) {
          filepath = filepath + '.html';
          extension = extensions['html'];
          isHTML = true;
        } else if (fs.existsSync(filepath + '.html.ejs')) {
          filepath = filepath + '.html.ejs';
          extension = extensions['html'];
          isEJS = true;
        }

        cache.getFile(filepath, extension.encoding, function(err, contents) {
          if (err) {
            console.error(err);
            this.respond404();
            return;
          }

          if (isHTML) {
            var header = this.getHeader();
            var footer = this.getFooter();
            contents = header + contents + footer;
          } else if (isEJS) {
            var header = this.getHeader();
            var footer = this.getFooter();
            var ejsData = this.getEJSData();
            var uriParams = this.getURLParams();
            for (var key in uriParams) {
              ejsData[key] = uriParams[key];
            }
            contents = ejs.render(contents, ejsData);
            contents = header + contents + footer;
          }

          this.respond200(contents, extension.contentType, extension.encoding);
        }.bind(this));
      },

      respond302: function(location) {
        this.respond(302, {'Content-Type': 'text/plain', 'Location': location});
      },

      respond404: function() {
        var extension = extensions['html'];
        var contents = this.getHeader() + this.get404Page() + this.getFooter();
        this.respond(404, {'Content-Type': 'text/html'}, contents, 'utf8');
      },

      isValidURI: function() {
        var filepath = this.webroot + this.getURI();
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

        if (!(realpath.indexOf(fs.realpathSync(this.webroot)) == 0)) {
          return false;
        }

        return true;
      },

      getHeader: function() {
        return ejs.render(cache.getFileSync(headerFile, 'utf8'), this.getEJSData());
      },

      getFooter: function() {
        return cache.getFileSync(footerFile, 'utf8');
      },

      get404Page: function() {
        return cache.getFileSync(fourOhFourFile, 'utf8');
      },

      getEJSData: function() {
        var uri = this.getURI();
        return {
          cssFiles: config.cssFiles[uri] || [],
          is_game: (uri == '/demo'),
          user: this.user,
          uri: uri,
          subdomain: this.getSubdomain()
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

      getSubdomain: function() {
        var host = this.request.headers.host;
        var subdomain = host.substr(0, host.indexOf('.'));
        if (subdomain == '') {
          subdomain = 'www';
        }
        return subdomain;
      },

      getURLParams: function() {
        return url.parse(this.request.url, true).query;
      },

      getURI: function() {
        var uri = this.request.url;
        if (uri.indexOf('?') == -1) {
          return uri;
        }
        // strip get params if there are any
        return uri.substr(0, uri.indexOf('?'));
      },

      setURI: function(uri) {
        this.request.url = uri;
      },

      setCookie: function(key, value) {
        this.setCookies[key] = value;
      }
    });
  }
);
