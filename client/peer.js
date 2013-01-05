function Peer(id) {
  this.id = id;
  this.cube = null;
}

Peer.prototype.draw = function() {
  if (this.cube == null) {
    return;
  }
  this.cube.draw();
};

Peer.prototype.updateTransform = function(pos, rot) {
  if (this.cube == null) {
    this.cube = new Cube(pos, rot);
  }
  this.cube.position = pos;
  this.cube.rotation = rot;
};
