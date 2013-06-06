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
        postMessage({
          coords: e.data.coords,
          heights: heights
        });
      } else {
        // assert not reached
      }
    };
  }
);
