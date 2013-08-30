// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'ejs',
    'fs',
    'module',
    'path',
    'url',
    'model/player',
    'model/session',
    'web/cache',
    'web/configs',
  ],
  function(Base, ejs, fs, module, path, url, playerModel, sessionModel, cache, configs) {

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
      'tgz': {contentType: 'text/plain', encoding: 'binary', gzip: true},
      'other': {contentType: 'text/plain', encoding: 'utf8'}
    };

    var headerFile = '/../template/header.html.ejs';
    var footerFile = '/../template/footer.html.ejs';
    var fourOhFourFile = '/../template/404.html';

    var webroot = __dirname + '/../../roots';

    return Base.extend({
      constructor: function(request, response, readyCallback) {
        this.request = request;
        this.response = response;
        this.readyCallback = readyCallback;
        this.setCookies = {};

        this.waitingOn = {
          'player': true,
          'session': true,
        };

        this.webroot = webroot + '/' + this.getSubdomain() + '/root/';

        // make sure subdomain exists
        if (!configs.hasOwnProperty(this.getSubdomain())) {
          this.respond(404, {'Content-Type': 'text/html'});
          return;
        }
        this.config = configs[this.getSubdomain()];

        // parse cookies
        this.cookies = {};
        if (request.headers.cookie) {
          request.headers.cookie.split(';').forEach(function(cookie) {
            var parts = cookie.split('=');
            this.cookies[parts[0].trim()] = (parts[1] || '').trim();
          }.bind(this));
        }

        // initiate the general session
        sessionModel.getSession(this.cookies['gsid'], this.fetchSession.bind(this), this.getSubdomain(), this.getClientIP());

        // see if there's some kind of user logged in
        if (this.cookies.hasOwnProperty('psid')) {
          playerModel.playerFromSessID(this.cookies['psid'], this.ready.bind(this, 'player'));
        } else {
          this.ready('player', null);
        }
      },

      fetchSession: function(session, sessid) {
        if (session && sessid) {
          this.setCookie('gsid', sessid);
        }
        this.ready('session', session);
      },

      ready: function(key, value) {
        this[key] = value;
        this.waitingOn[key] = false;
        for (var key in this.waitingOn) {
          if (this.waitingOn[key]) {
            // not ready yet
            return;
          }
        }

        // everything is ready
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

      respond200: function(contents, contentType, encoding, gzip) {
        var headers = {'Content-Type': contentType};
        if (gzip) {
          headers['Content-Encoding'] = 'gzip';
        }

        this.respond(200, headers, contents, encoding);
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

          this.respond200(contents, extension.contentType, extension.encoding, extension.gzip);
        }.bind(this));
      },

      respond302: function(location) {
        this.respond(302, {'Location': location});
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
        return ejs.render(cache.getFileSync(this.webroot + headerFile, 'utf8'), this.getEJSData());
      },

      getFooter: function() {
        return ejs.render(cache.getFileSync(this.webroot + footerFile, 'utf8'), this.getEJSData());
      },

      get404Page: function() {
        return cache.getFileSync(this.webroot + fourOhFourFile, 'utf8');
      },

      getEJSData: function() {
        var uri = this.getURI();
        return {
          cssFiles: this.config.cssFiles[uri] || [],
          is_game: (uri == '/demo' || uri == '/demo2'),
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

      getClientIP: function() {
        return this.request.connection.remoteAddress;
      },

      getSubdomain: function() {
        var host = this.request.headers.host;
        var subdomain = host.substr(0, host.indexOf('.'));
        if (subdomain == 'venz' || subdomain == '') {
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
