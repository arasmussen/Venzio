var camera;
var canvas;
var client_id;
var framerate;
var gl;
var peers = {};
var socket;
var terrainManager;

var pMatrix = mat4.create();
var mvMatrix = mat4.create();

var terrainLength = 32;
