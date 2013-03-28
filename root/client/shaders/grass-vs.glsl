precision mediump float;

attribute vec3 Position;
attribute vec2 TextureCoord;
attribute float Layer;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec2 texCoord;
varying float layer;

void main(void) {
  vec4 pos = vec4(Position, 1.0);
  pos.y += 0.01 * Layer;
  gl_Position = uPMatrix * uMVMatrix * pos;

  // pass stuff to fragment
  texCoord = TextureCoord;
  layer = Layer;
}
