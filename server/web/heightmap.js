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
      invalidParameter(side, response);
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

  var iterations = 25;
  var noiseMatrix = [];

  for (var x = 0; x < dimensions.x + 2 * iterations; x++) {
    for (var y = 0; y < dimensions.y + 2 * iterations; y++) {
      var idx = x * (dimensions.y + 2 * iterations) + y;
      noiseMatrix[idx] = srand.random();
    }
  }

  var beforeIteration = noiseMatrix;

  for (var iteration = 1; iteration <= iterations; iteration++) {
    var offset = iterations - iteration;
    afterIteration = [];
    for (var x = 0; x < dimensions.x + 2 * offset; x++) {
      for (var y = 0; y < dimensions.y + 2 * offset; y++) {
        var beforeIdx = (x + 1) * (dimensions.y + 2 * (offset + 1)) + y + 1;
        var afterIdx = x * (dimensions.y + 2 * offset) + y;

        var above = beforeIdx - 1;
        var below = beforeIdx + 1;
        var left = beforeIdx - (dimensions.y + 2 * (offset + 1));
        var right = beforeIdx + (dimensions.y + 2 * (offset + 1));
        var center = beforeIdx;

        var after =
          0.15 * beforeIteration[above] +
          0.15 * beforeIteration[below] +
          0.15 * beforeIteration[left] +
          0.15 * beforeIteration[right] +
          0.4 * beforeIteration[center];
        after = Math.min(Math.max((after - 0.47) * 1.3 + 0.47, 0.0), 0.999);

        afterIteration[afterIdx] = after;
      }
    }
    beforeIteration = afterIteration;
  }

  var image = new PNG({
    width: dimensions.x,
    height: dimensions.y
  });
  image.data = [];
  for (var x = 0; x < dimensions.x; x++) {
    for (var y = 0; y < dimensions.y; y++) {
      var beforeIdx = x * dimensions.y + y;
      var imageIdx = beforeIdx * 4;

      var mountains = beforeIteration[beforeIdx] < 0.5;

      image.data[imageIdx + 0] = 0;
      image.data[imageIdx + 1] = mountains ? 0 : 255;
      image.data[imageIdx + 2] = mountains ? 255 : 0;
      image.data[imageIdx + 3] = 255;
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
