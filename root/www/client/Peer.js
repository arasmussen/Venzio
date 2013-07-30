// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'client/meshes/CapsuleMesh',
    'client/meshes/WallMesh'
  ],
  function(Base, Capsule, Wall) {
    return Base.extend({
      constructor: function(id, pos, terrainManager) {
        this.id = id;
        this.position = pos;
        this.rotation = {
          pitch: 0,
          yaw: 0
        };

        var radius = 1.0;
        var height = 5.0;
        var bottom = {
          x: pos.x,
          y: pos.y + radius,
          z: pos.z
        };

        this.buildMode = false;
        // this.buildObject = new Wall(this, terrainManager);

        this.freeFloat = false;
        this.capsule = new Capsule(bottom, radius, height);
      },

      draw: function() {
        this.capsule.draw();
        if (this.buildMode) {
          this.buildObject.draw();
        }
      },

      updateTransform: function(pos, rot) {
        this.position = pos;

        // TODO: explore if this is actually faster than "this.rotation = rot;"
        // and if so, convert the entire codebase
        this.rotation = {
          pitch: rot.pitch,
          yaw: rot.yaw
        }
        this.capsule.updatePosRot(pos, rot);
        if (this.buildMode) {
          this.buildObject.update();
        }
      },

      setState: function(state) {
        // TODO: refactor
        this.buildMode = Boolean(0x0001 & state.toggles);
        this.freeFloat = Boolean(0x0002 & state.toggles);
      }
    });
  }
);
