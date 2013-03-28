precision mediump float;

uniform sampler2D fatty_texture;

varying vec2 texCoord;

void main(void) {
  gl_FragColor = texture2D(fatty_texture, texCoord);
}
