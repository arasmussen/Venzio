var camera = {
  position: {x: 0.0, y: 0.0, z: 0.0},

  handleInput: function() {
    if (input.isKeyPressed(37) || input.isKeyPressed(65)) {
      this.position.x += 0.1;
    }
    if (input.isKeyPressed(39) || input.isKeyPressed(68)) {
      this.position.x -= 0.1;
    }
    if (input.isKeyPressed(38) || input.isKeyPressed(87)) {
      this.position.z += 0.1;
    }
    if (input.isKeyPressed(40) || input.isKeyPressed(83)) {
      this.position.z -= 0.1;
    }
  },

  transform: function(matrix) {
    var translate = [
      this.position.x,
      this.position.y,
      this.position.z
    ];
    mat4.translate(mvMatrix, translate);
  }
};
