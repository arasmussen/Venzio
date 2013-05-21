// Copyright (c) Venzio 2013 All Rights Reserved

importScripts('../../node_modules/requirejs/require.js');

require({
    baseUrl: '../..',
    paths: {
      basejs: 'root/client/lib/Base',
      shared: 'root/shared',
      server: 'server/socket'
    }
  },
  ['shared/HeightmapSectionFetcher'],
  function(HeightmapSectionFetcher) {
    postMessage({
      type: 'require'
    });

    var sectionFetcher;
    onmessage = function(e) {
      var type = e.data.type;
      if (type == 'init') {
        sectionFetcher = new HeightmapSectionFetcher(e.data.options);
      } else if (type == 'fetch') {
        var length = sectionFetcher.terrainLength;

        var heights = sectionFetcher.fetch(e.data.coords);
        var heightMatrix = [];
        for (var i = 0; i < length + 1; i++) {
          heightMatrix[i] = [];
          for (var j = 0; j < length + 1; j++) {
            var idx = i * (length + 1) + j;
            heightMatrix[i][j] = (255 - heights[idx]) / 6 - 8;
          }
        }
        postMessage({
          coords: e.data.coords,
          heights: heightMatrix
        });
      } else {
        // assert not reached
      }
    };
  }
);
