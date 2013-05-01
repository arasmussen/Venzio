var fs = require('fs');
var http = require('http');

var webroot = __dirname + '/../../root';

var extensions = {
  'html': {contentType: 'text/html', binary: false},
  'css': {contentType: 'text/css', binary: false},
  'js': {contentType: 'application/javascript', binary: false},
  'gif': {contentType: 'image/gif', binary: true},
  'jpeg': {contentType: 'image/jpeg', binary: true},
  'jpg': {contentType: 'image/jpeg', binary: true},
  'png': {contentType: 'image/png', binary: true},
  'ico': {contentType: 'image/ico', binary: true},
  'other': {contentType: 'text/plain', binary: false}
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
  var fullpath = webroot + url;
  if (fullpath.indexOf('?') == -1) {
    return fullpath;
  }
  return fullpath.substr(0, fullpath.indexOf('?'));
}

http.createServer(function(request, response) {
  var url = request.url;

  var filepath = getFilepath(url);
  if (!fs.existsSync(filepath)) {
    response.writeHead(404);
    response.end();
    return;
  }

  var extension = getExtension(url);
  response.writeHead(200, {'Content-Type': extension.contentType});
  var contents = fs.readFileSync(filepath, extension.binary ? 'binary' : 'utf8');
  response.end(contents, extension.binary ? 'binary' : 'utf8');
}).listen(80);
