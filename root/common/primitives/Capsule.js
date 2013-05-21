// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'common/primitives/Cylinder',
    'common/primitives/Sphere'
  ],
  function(Base, Cylinder, Sphere) {
    return Base.extend({
      constructor: function(cylinderBottom, radius, cylinderHeight) {
        var cylinderTop = {
          x: cylinderBottom.x,
          y: cylinderBottom.y + cylinderHeight,
          z: cylinderBottom.z
        };

        this.cylinder = new Cylinder(cylinderBottom, radius, cylinderHeight);
        this.bottomSphere = new Sphere(cylinderBottom, radius);
        this.topSphere = new Sphere(cylinderTop, radius);

        this.radius = radius;
        this.height = cylinderHeight;
      },

      updatePosRot: function(pos, rot) {
        var bottom = {
          x: pos.x,
          y: pos.y + this.radius,
          z: pos.z
        };
        var top = {
          x: pos.x,
          y: pos.y + this.radius + this.height,
          z: pos.z
        };
        this.cylinder.position = bottom;
        this.bottomSphere.position = bottom;
        this.topSphere.position = top;

        this.cylinder.rotation.yaw = rot.yaw;
        this.bottomSphere.rotation.yaw = rot.yaw;
        this.topSphere.rotation.yaw = rot.yaw;
      }
    });
  }
);
