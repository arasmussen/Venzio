// Copyright (c) Venzio 2013 All Rights Reserved

define(function() {
  return {
    address: '/',
    port: 8080,

    // should be divisible by 4 for seamless textures
    terrainLength: 32,
    terrainOffset: 6,

    // walls
    walls: {
      width: 1.0,
      depth: 0.1,
      height: 1.0
    },

    buildDistance: 4.0,
    buildSnapThreshold: 0.3,

    normalize: function(vec3) {
      if (vec3.x == 0.0 && vec3.y == 0.0 && vec3.z == 0.0) {
        return vec3;
      }

      var factor = 1.0 / Math.sqrt(
        Math.pow(vec3.x, 2) + Math.pow(vec3.y, 2) + Math.pow(vec3.z, 2)
      );
      return {
        x: vec3.x * factor,
        y: vec3.y * factor,
        z: vec3.z * factor
      };
    },

    distance: function(v1, v2) {
      var distance = Math.sqrt(
        Math.pow(v1.x - v2.x, 2) +
        Math.pow(v1.y - v2.y, 2) +
        Math.pow(v1.z - v2.z, 2)
      );
      return distance;
    },

    floatEquals: function(v1, v2, epsilon) {
      return (v1 > (v2 - epsilon) && v1 < (v2 + epsilon));
    }
  }
});
