// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'pngjs',
    'url',
    'server/HeightmapSectionFetcher',
    'shared/Globals'
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

        this.response = response;

        this.terrainLength = Globals.terrainLength;
      },

      handle: function() {
        if (!this.errorCheck()) {
          return;
        }

        var sectionFetcher = HeightmapSectionFetcher.get(this.seed);

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
            for (var i = 0; i < this.terrainLength; i++) {
              for (var j = 0; j < this.terrainLength; j++) {
                var sectionIdx = i * this.terrainLength + j;
                var imageIdx = 4 * ((i + imageOffset.x) * image.height + (j + imageOffset.y));

                var mountains = sectionData[sectionIdx] < 0.4;

                image.data[imageIdx + 0] = sectionData[sectionIdx] * 255;
                image.data[imageIdx + 1] = sectionData[sectionIdx] * 255;
                image.data[imageIdx + 2] = sectionData[sectionIdx] * 255; // mountains ? 255 : 0;
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
          invalidParameter('right');
          return false;
        }
        if (this.top <= this.bottom) {
          invalidParameter('left');
          return false;
        }

        return true;
      }
    });
  }
);
