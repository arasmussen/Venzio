// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'pngjs',
    'url',
    'common/HeightmapSectionFetcher',
    'common/Globals'
  ],
  function(Base, pngjs, url, HeightmapSectionFetcher, Globals) {
    var PNG = pngjs.PNG;

    return Base.extend({
      constructor: function(request, response) {
        urlParams = url.parse(request.url, true).query;

        this.left = urlParams.hasOwnProperty('left') ? parseInt(urlParams['left']) : 0;
        this.right = urlParams.hasOwnProperty('right') ? parseInt(urlParams['right']) : 1;
        this.bottom = urlParams.hasOwnProperty('bottom') ? parseInt(urlParams['bottom']) : 0;
        this.top = urlParams.hasOwnProperty('top') ? parseInt(urlParams['top']) : 1;

        this.seed = urlParams.hasOwnProperty('seed') ? parseInt(urlParams['seed']) : Date.now();
        this.distance = urlParams.hasOwnProperty('distance') ? parseInt(urlParams['distance']) : 2;
        this.amount = urlParams.hasOwnProperty('amount') ? parseInt(urlParams['amount']) : 2;
        this.contrast = urlParams.hasOwnProperty('contrast') ? parseInt(urlParams['contrast']) : 5;

        this.response = response;

        this.terrainLength = Globals.terrainLength;
      },

      handle: function() {
        if (!this.errorCheck()) {
          return;
        }

        var sectionFetcher = HeightmapSectionFetcher.get(this.seed, this.distance, this.amount, this.contrast);

        var imageSize = {
          x: (this.right - this.left) * this.terrainLength,
          y: (this.top - this.bottom) * this.terrainLength
        };

        var image = new PNG({
          width: imageSize.x,
          height: imageSize.y
        });
        image.data = [];

        for (var x = this.left; x < this.right; x++) {
          for (var y = this.bottom; y < this.top; y++) {
            var sectionData = sectionFetcher.fetch(x, y);
            var imageOffset = {
              x: (x - this.left) * this.terrainLength,
              y: (y - this.bottom) * this.terrainLength
            };
            for (var i = 0; i < this.terrainLength + 1; i++) {
              for (var j = 0; j < this.terrainLength + 1; j++) {
                var sectionIdx = i * (this.terrainLength + 1) + j;
                var height = sectionData[sectionIdx];
                var imageIdx = 4 * ((j + imageOffset.y) * image.width + (i + imageOffset.x));
                image.data[imageIdx + 0] = height;
                image.data[imageIdx + 1] = height;
                image.data[imageIdx + 2] = height;
                image.data[imageIdx + 3] = 255;
              }
            }
          }
        }

        var imageBuffers = [];
        image.pack()
          .on('data', function(buffer) { imageBuffers.push(buffer); })
          .on('end', function() {
            var imageData = Buffer.concat(imageBuffers);
            this.response.writeHead(200, {'Content-Type': 'image/png'});
            this.response.end(new Buffer(imageData), 'binary');
          }.bind(this));
      },

      invalidParameter: function(param) {
        this.response.writeHead(200, {'Content-Type': 'text/plain'});
        this.response.end('Parameter ' + param + ' is invalid', 'utf8');
      },

      isNumber: function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      },

      errorCheck: function() {
        var check = {
          'left': this.left,
          'right': this.right,
          'bottom': this.bottom,
          'top': this.top,
          'seed': this.seed
        };
        for (var param in check) {
          if (!this.isNumber(check[param])) {
            this.invalidParameter(param);
            return false;
          }
        }
        if (this.right <= this.left) {
          this.invalidParameter('right');
          return false;
        }
        if (this.top <= this.bottom) {
          this.invalidParameter('top');
          return false;
        }

        return true;
      }
    });
  }
);