// Copyright (c) Venzio 2013 All Rights Reserved

importScripts('../../node_modules/requirejs/require.js');

require({
    baseUrl: '../..',
    paths: {
      basejs: 'root/common/lib/third-party/Base',
      common: 'root/common',
      server: 'server/socket'
    }
  },
  ['common/HeightmapSectionFetcher'],
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
        var normalDistance = sectionFetcher.normalDistance;

        var heights = sectionFetcher.fetch(e.data.coords);
        for (var x = -normalDistance; x <= length + normalDistance; x++) {
          for (var z = -normalDistance; z <= length + normalDistance; z++) {
            heights[x][z] = (255 - heights[x][z]) / 6 - 8;
          }
        }

        for (var x = -normalDistance; x <= length + normalDistance; x++) {
          postMessage({
            coords: e.data.coords,
            row: x,
            heights: heights[x]
          });
        }
      } else {
        // assert not reached
      }
    };
  }
);
