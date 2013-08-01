// Copyright (c) Venzio 2013 All Rights Reserved

importScripts('../client/lib/require.js');

require({
    baseUrl: '..',
    paths: {
      basejs: 'common/lib/third-party/Base'
    }
  },
  ['common/HeightmapSectionFetcher'],
  function(HeightmapSectionFetcher) {
    postMessage({
      type: 'require'
    });

    var sectionFetcher;
    onmessage = function(e) {
      var sendMessage = function(message) {
        postMessage(message);
      };

      var type = e.data.type;
      if (type == 'init') {
        sectionFetcher = new HeightmapSectionFetcher(e.data.options);
      } else if (type == 'fetch') {
        var length = sectionFetcher.terrainLength;
        var normalDistance = sectionFetcher.normalDistance;

        var heights = sectionFetcher.fetch(e.data.coords);
        /*
        for (var x = -normalDistance; x <= length + normalDistance; x++) {
          for (var z = -normalDistance; z <= length + normalDistance; z++) {
            heights[x][z] = (255 - heights[x][z]) / 9 - 6;
          }
        }
        */

        for (var x = 0; x <= length + 2 * normalDistance; x++) {
          var row = x - normalDistance;
          setTimeout(sendMessage.bind(null, {
            coords: e.data.coords,
            row: row,
            heights: heights[row]
          }), 25 * x);
        }
      } else {
        // assert not reached
      }
    };
  }
);
