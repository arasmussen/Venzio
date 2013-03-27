precision mediump float;

attribute vec3 Position;
attribute vec2 TextureCoord;
attribute float Layer;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec2 texCoord;
varying float layer;

void main(void) {
  gl_Position = uPMatrix * uMVMatrix * vec4(Position, 1.0);
  texCoord = TextureCoord;
  layer = Layer;
}
