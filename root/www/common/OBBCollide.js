// Copyright (c) Venzio 2013 All Rights Reserved

define(function() {
  function CrossProduct(v1, v2) {
    return {
      x: v1.y * v2.z - v1.z * v2.y,
      y: v1.z * v2.x - v1.x * v2.z,
      z: v1.x * v2.y - v1.y * v2.x
    };
  }

  function DotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }

  function Distance(v1, v2) {
    return Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2) + Math.pow(v2.z - v1.z, 2));
  }

  return function(aVerts, bVerts) {
    var aCenter = {x: 0.0, y: 0.0, z: 0.0};
    var bCenter = {x: 0.0, y: 0.0, z: 0.0};

    for (var i = 0; i < 8; i++) {
      aCenter.x += aVerts[i].x / 8;
      aCenter.y += aVerts[i].y / 8;
      aCenter.z += aVerts[i].z / 8;
      bCenter.x += bVerts[i].x / 8;
      bCenter.y += bVerts[i].y / 8;
      bCenter.z += bVerts[i].z / 8;
    }

    var centerDiff = {
      x: bCenter.x - aCenter.x,
      y: bCenter.y - aCenter.y,
      z: bCenter.z - aCenter.z
    };

    var aUnitVectors = {
      x: {x: aVerts[4].x - aVerts[0].x, y: aVerts[4].y - aVerts[0].y, z: aVerts[4].z - aVerts[0].z},
      y: {x: aVerts[2].x - aVerts[0].x, y: aVerts[2].y - aVerts[0].y, z: aVerts[2].z - aVerts[0].z},
      z: {x: aVerts[1].x - aVerts[0].x, y: aVerts[1].y - aVerts[0].y, z: aVerts[1].z - aVerts[0].z},
    };
    var bUnitVectors = {
      x: {x: bVerts[4].x - bVerts[0].x, y: bVerts[4].y - bVerts[0].y, z: bVerts[4].z - bVerts[0].z},
      y: {x: bVerts[2].x - bVerts[0].x, y: bVerts[2].y - bVerts[0].y, z: bVerts[2].z - bVerts[0].z},
      z: {x: bVerts[1].x - bVerts[0].x, y: bVerts[1].y - bVerts[0].y, z: bVerts[1].z - bVerts[0].z},
    };

    for (var i in aUnitVectors) {
      var sum = 0;
      for (var j in aUnitVectors[i]) {
        sum += aUnitVectors[i][j] * aUnitVectors[i][j];
      }
      var factor = 1 / Math.sqrt(sum);
      for (var j in aUnitVectors[i]) {
        aUnitVectors[i][j] *= factor;
      }
    }
    for (var i in bUnitVectors) {
      var sum = 0;
      for (var j in bUnitVectors[i]) {
        sum += bUnitVectors[i][j] * bUnitVectors[i][j];
      }
      var factor = 1 / Math.sqrt(sum);
      for (var j in bUnitVectors[i]) {
        bUnitVectors[i][j] *= factor;
      }
    }

    var aHalfWidth = {
      x: Distance(aVerts[0], aVerts[4]) / 2,
      y: Distance(aVerts[0], aVerts[2]) / 2,
      z: Distance(aVerts[0], aVerts[1]) / 2
    };
    var bHalfWidth = {
      x: Distance(bVerts[0], bVerts[4]) / 2,
      y: Distance(bVerts[0], bVerts[2]) / 2,
      z: Distance(bVerts[0], bVerts[1]) / 2
    };

    var axes = [
      aUnitVectors.x,
      aUnitVectors.y,
      aUnitVectors.z,
      bUnitVectors.x,
      bUnitVectors.y,
      bUnitVectors.z,
      CrossProduct(aUnitVectors.x, bUnitVectors.x),
      CrossProduct(aUnitVectors.x, bUnitVectors.y),
      CrossProduct(aUnitVectors.x, bUnitVectors.z),
      CrossProduct(aUnitVectors.y, bUnitVectors.x),
      CrossProduct(aUnitVectors.y, bUnitVectors.y),
      CrossProduct(aUnitVectors.y, bUnitVectors.z),
      CrossProduct(aUnitVectors.z, bUnitVectors.x),
      CrossProduct(aUnitVectors.z, bUnitVectors.y),
      CrossProduct(aUnitVectors.z, bUnitVectors.z)
    ];

    for (var i in axes) {
      var axis = axes[i];
      var leftSide = Math.abs(DotProduct(centerDiff, axis));
      var rightSide = (
        Math.abs(aHalfWidth.x * DotProduct(aUnitVectors.x, axis)) +
        Math.abs(aHalfWidth.y * DotProduct(aUnitVectors.y, axis)) +
        Math.abs(aHalfWidth.z * DotProduct(aUnitVectors.z, axis)) +
        Math.abs(bHalfWidth.x * DotProduct(bUnitVectors.x, axis)) +
        Math.abs(bHalfWidth.y * DotProduct(bUnitVectors.y, axis)) +
        Math.abs(bHalfWidth.z * DotProduct(bUnitVectors.z, axis))
      );
      if (leftSide > rightSide) {
        return false;
      }
    }
    return true;
  }
});
