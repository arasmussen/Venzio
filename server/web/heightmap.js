var url = require('url');

module.exports = function(requestURL) {
  var url_parts = url.parse(requestURL, true);
  var query = url_parts.query;

  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end(query, 'utf8');
}
