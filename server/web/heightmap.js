var PNG = require('pngjs').PNG;
var srand = require('srand');
var url = require('url');

var pixelsPerUnit = 16;

function invalidParameter(parameter, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end('Parameter ' + parameter + ' is invalid', 'utf8');
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function errorCheck(query, response) {
  var left = query.hasOwnProperty('left') ? query['left'] : 0;
  var right = query.hasOwnProperty('right') ? query['right'] : 10;
  var bottom = query.hasOwnProperty('bottom') ? query['bottom'] : 0;
  var top = query.hasOwnProperty('top') ? query['top'] : 10;

  var check = {'left': left, 'right': right, 'bottom': bottom, 'top': top};
  for (var side in check) {
    if (!isNumber(check[side])) {
      invalidParamter(side, response);
      return false;
    }
  }
  if (right <= left) {
    invalidParameter('right', response);
    return false;
  }
  if (top <= bottom) {
    invalidParameter('left', response);
    return false;
  }

  if (query.hasOwnProperty('seed')) {
    if (!isNumber(query['seed'])) {
      invalidParameter('seed', response);
      return false;
    }
  }

  return true;
}

module.exports = function(request, response) {
  var url_parts = url.parse(request.url, true);
  var query = url_parts.query;

  if (!errorCheck(query, response)) {
    return;
  }

  if (query.hasOwnProperty('seed')) {
    srand.seed(query['seed']);
  }

  var left = query.hasOwnProperty('left') ? query['left'] : 0;
  var right = query.hasOwnProperty('right') ? query['right'] : 10;
  var bottom = query.hasOwnProperty('bottom') ? query['bottom'] : 0;
  var top = query.hasOwnProperty('top') ? query['top'] : 10;

  var dimensions = {
    x: (right - left) * pixelsPerUnit,
    y: (top - bottom) * pixelsPerUnit
  };

  var image = new PNG({
    width: dimensions.x,
    height: dimensions.y
  });

  for (var x = 0; x < dimensions.x; x++) {
    for (var y = 0; y < dimensions.y; y++) {
      var idx = 4 * (x * dimensions.y + y);

      image.data[idx + 0] = 128;
      image.data[idx + 1] = 128;
      image.data[idx + 2] = 128;
      image.data[idx + 3] = 255;
    }
  }

  var imageBuffers = [];
  image.pack()
    .on('data', function(buffer) { imageBuffers.push(buffer); })
    .on('end', function() {
      var imageData = Buffer.concat(imageBuffers);
      response.writeHead(200, {'Content-Type': 'image/png'});
      response.end(new Buffer(imageData), 'binary');
    });
}
