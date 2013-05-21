// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'shared/TerrainManager',
    'module',
    'path',
    'webworker-threads'
  ],
  function(TerrainManager, module, path, webworker) {
    return TerrainManager.extend({
      getWorker: function() {
        return webworker.Worker;
      },

      getWorkerPath: function() {
        var dirname = path.dirname(module.uri);
        return dirname + '/STerrainWorker.js';
      }
    });
  }
);
