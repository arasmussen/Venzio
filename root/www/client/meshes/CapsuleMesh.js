// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'client/meshes/CylinderMesh',
    'client/meshes/SphereMesh',
    'common/primitives/Capsule'
  ],
  function(Base, CylinderMesh, SphereMesh, Capsule) {
    return Base.extend({
      constructor: function(cylinderBottom, radius, cylinderHeight) {
        this.capsule = new Capsule(cylinderBottom, radius, cylinderHeight);

        var cylinderTop = {
          x: cylinderBottom.x,
          y: cylinderBottom.y + cylinderHeight,
          z: cylinderBottom.z
        };
        this.cylinder = new CylinderMesh(cylinderBottom, radius, cylinderHeight);
        this.bottomSphere = new SphereMesh(cylinderBottom, radius);
        this.topSphere = new SphereMesh(cylinderTop, radius);

        this.initialize();
      },

      initialize: function() {
        this.cylinder.initialize();
        this.bottomSphere.initialize();
        this.topSphere.initialize();
      },

      draw: function() {
        this.cylinder.draw();
        this.bottomSphere.draw();
        this.topSphere.draw();
      },

      updatePosRot: function(pos, rot) {
        rot = {
          pitch: 0,
          yaw: rot.yaw
        };
        var bottom = {
          x: pos.x,
          y: pos.y + this.capsule.radius,
          z: pos.z
        };
        var top = {
          x: pos.x,
          y: pos.y + this.capsule.radius + this.capsule.height,
          z: pos.z
        };
        this.cylinder.updatePosRot(bottom, rot);
        this.bottomSphere.updatePosRot(bottom, rot);
        this.topSphere.updatePosRot(top, rot);
      }
    });
  }
);
