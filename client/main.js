window.onload = init;

var camera;
var canvas;
var client_id;
var framerate;
var gl;
var peers = {};
var socket;

var pMatrix = mat4.create();
var mvMatrix = mat4.create();

function init() {
  canvas = document.getElementById('canvas');

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    return;
  }
  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;

  input.initialize();

  camera = new Camera({x: 0.0, y: -10.0, z: -10.0});
  framerate = new Framerate('framerate');
  terrain = new Terrain({x: 0.0, y: 0.0, z: 0.0});

  socket = new io.connect('http://gfx.rasmuzen.com', {port: 8080});
  socket.on('setID', setID);
  socket.on('updateClient', updateClient);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  render();
}

function setID(data) {
  client_id = data.id;
}

function updateClient(data) {
  while (data.queue.length > 0) {
    var node = data.queue.shift();
    if (node.message == 'connect') {
      if (!peers.hasOwnProperty(node.id)) {
        var peer = new Peer(node.id);
        peers[node.id] = peer;
      }
    } else if (node.message == 'disconnect') {
      if (peers.hasOwnProperty(node.id)) {
        delete peers[node.id];
      }
    } else if (node.message == 'enabled multiplayer') {
    } else if (node.message == 'disabled multiplayer') {
    } else if (node.message == 'update peer') {
      if (node.id == client_id) {
        continue;
      }

      if (!peers.hasOwnProperty(node.id)) {
        var peer = new Peer(node.id);
        peers[node.id] = peer;
      }

      peers[node.id].updateTransform(node.position, node.rotation);
    }
  }
}

function render() {
  framerate.snapshot();

  handleInput();
  updateWorld();
  drawWorld();

  window.requestAnimFrame(render, canvas);
}

function handleInput() {
  camera.handleInput();
}

function updateWorld() {
  socket.emit('updateServer', {
    position: camera.position,
    rotation: camera.rotation
  });
}

function drawWorld() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(45.0, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
  mat4.identity(mvMatrix);

  camera.transform();
  terrain.draw();

  for (id in peers) {
    if (id == client_id) {
      continue;
    }
    peers[id].draw();
  }

}
