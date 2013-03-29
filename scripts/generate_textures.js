var fs = require('fs');

var Buffer = require('Buffer');
var Png = require('node-png').Png;

var length = 128;

var path = __dirname + '/../root/client/textures'

var pixels = new Buffer(4 * length * length);
for (var x = 0; x < length; x++) {
  for (var y = 0; y < length; y++) {
    var rand = Math.random();
    var pixel = 4 * (x * length + y);
    pixels[pixel + 0] = Math.floor(255 * rand);
    pixels[pixel + 1] = Math.floor(255 * rand);
    pixels[pixel + 2] = Math.floor(255 * rand);
    pixels[pixel + 3] = Math.floor(255 * rand);
  }
}
var png = new Png(pixels, length, length, 'rgba');
var encodedData = png.encodeSync();
var filename = path + '/grass.png';
fs.writeFileSync(filename, encodedData);
