var fs = require('fs');
var srand = require('srand');

var Buffer = require('Buffer');
var Png = require('node-png').Png;

var length = 128;
var layers = 16;

var thickness = 0.3;

var seed = Date.now();

var path = __dirname + '/../root/client/textures'

var pixels = [];
for (var layer = 0; layer < layers; layer++) {
  srand.seed(seed);
  pixels[layer] = new Buffer(4 * length * length);
  var density = (1 - (layer / layers)) * thickness;
  for (var x = 0; x < length; x++) {
    for (var y = 0; y < length; y++) {
      var rand = srand.random();
      var pixel = 4 * (x * length + y);
      if (rand < density) {
        pixels[layer][pixel + 0] = 0;
        pixels[layer][pixel + 1] = 150;
        pixels[layer][pixel + 2] = 0;
        pixels[layer][pixel + 3] = 150 * (layer / layers);
      } else {
        pixels[layer][pixel + 0] = 0;
        pixels[layer][pixel + 1] = 0;
        pixels[layer][pixel + 2] = 0;
        pixels[layer][pixel + 3] = 255;
      }
    }
  }
  var png = new Png(pixels[layer], length, length, 'rgba');
  var encodedData = png.encodeSync();
  var filename = path + '/grass_' + layer + '.png';
  fs.writeFileSync(filename, encodedData);
}
