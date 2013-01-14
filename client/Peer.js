function Peer(id) {
  this.id = id;
  this.capsule = null;
}

Peer.prototype.draw = function() {
  if (this.capsule == null) {
    return;
  }
  this.capsule.draw();
};

Peer.prototype.updateTransform = function(pos, rot) {
  if (this.capsule == null) {
    var radius = 1.0;
    var height = 5.0;
    var bottom = {
      x: pos.x,
      y: pos.y + radius,
      z: pos.z
    };
    this.capsule = new Capsule(bottom, radius, height);
  }
  this.capsule.updatePosRot(pos, rot);
};
