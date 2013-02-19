define([
    'shared/TerrainManager',
    'client/Drawable'
  ],
  function(TerrainManager, Drawable) {
    return Drawable.extend({
      constructor: function(attachee) {
        this.base(true);
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
        this.initialize();
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
      },

      getData: function(attrib) {
        if (attrib == 'Position') {
          return this.positionData;
        } else if (attrib == 'Color') {
          return new Float32Array([
            1.0, 0.0, 0.2, 1.0,
            1.0, 0.0, 0.2, 1.0,
            1.0, 1.0, 0.2, 1.0,
            1.0, 1.0, 0.2, 1.0,
            1.0, 0.0, 0.2, 1.0,
            1.0, 0.0, 0.2, 1.0,
            1.0, 1.0, 0.2, 1.0,
            1.0, 1.0, 0.2, 1.0
          ]);
        }
      },

      getIndexData: function() {
        return new Uint16Array([
          0, 1, 2, 1, 2, 3, // left
          2, 3, 6, 3, 6, 7, // top
          6, 7, 4, 7, 4, 5, // right
          4, 5, 0, 5, 0, 1, // bottom
          0, 2, 4, 2, 4, 6, // front
          1, 3, 5, 3, 5, 7 // back
        ]);
      },

      isDynamic: function(attrib) {
        if (attrib == 'Position') {
          return true;
        }
        return false;
      },

      getNumItems: function() {
        return 36;
      },

      getShaderName: function() {
        return 'color';
      }
    });
  }
);
