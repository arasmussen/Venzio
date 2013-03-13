define([
    'basejs',
    'client/meshes/CapsuleMesh'
  ],
  function(Base, Capsule) {
    return Base.extend({
      constructor: function(id, pos) {
        this.id = id;

        var radius = 1.0;
        var height = 5.0;
        var bottom = {
          x: pos.x,
          y: pos.y + radius,
          z: pos.z
        };
        this.capsule = new Capsule(bottom, radius, height);
      },

      draw: function() {
        this.capsule.draw();
      },

      updateTransform: function(pos, rot) {
        this.capsule.updatePosRot(pos, rot);
      }
    });
  }
);
