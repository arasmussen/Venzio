precision mediump float;

uniform sampler2D wood_texture;

varying vec2 texCoord;

void main(void) {
  gl_FragColor = texture2D(wood_texture, texCoord);
}
