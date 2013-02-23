define([
    'shared/TerrainManager',
    'basejs'
  ],
  function(TerrainManager, Base) {
    return Base.extend({
      constructor: function(attachee) {
        this.attachee = attachee;
        this.width = 1.0;
        this.depth = 0.1;
        this.distance = 5.0;
        this.height = 1.0;
        this.positionData = new Float32Array([
          -this.width / 2, 0.0, -this.depth / 2,
          -this.width / 2, 0.0, this.depth / 2,
          -this.width / 2, this.height, -this.depth / 2,
          -this.width / 2, this.height, this.depth / 2,
          this.width / 2, 0.0, -this.depth / 2,
          this.width / 2, 0.0, this.depth / 2,
          this.width / 2, this.height, -this.depth / 2,
          this.width / 2, this.height, this.depth / 2
        ]);
      },

      update: function() {
        this.rotation.yaw = this.attachee.rotation.yaw;
        var yawComponent = {
          x: Math.sin(this.rotation.yaw),
          z: Math.cos(this.rotation.yaw)
        };
        this.position.x = this.attachee.position.x - this.distance * yawComponent.x;
        this.position.z = this.attachee.position.z - this.distance * yawComponent.z;
        this.position.y = TerrainManager.getTerrainHeight(this.position);
        for (var i = 0; i < 4; i++) {
          var j = ((i < 2) ? (i * 3) : ((i + 2) * 3));
          this.positionData[j + 1] = TerrainManager.getTerrainHeight({
            x: this.position.x +
              (i < 2 ? -1.0 : 1.0) * (this.width / 2) * yawComponent.z +
              (i % 2 == 0 ? -1.0 : 1.0) * (this.depth / 2) * yawComponent.x,
            z: this.position.z +
              (i % 2 == 0 ? -1.0 : 1.0) * (this.depth / 2) * yawComponent.z -
              (i < 2 ? -1.0 : 1.0) * (this.width / 2) * yawComponent.x
          }) - this.position.y;
          this.positionData[j + 7] = this.positionData[j + 1] + 1.0;
        }
      }
    });
  }
);
