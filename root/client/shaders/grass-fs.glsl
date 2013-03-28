precision mediump float;

uniform sampler2D grass_0_texture;
uniform sampler2D grass_1_texture;
uniform sampler2D grass_2_texture;
uniform sampler2D grass_3_texture;
uniform sampler2D grass_4_texture;
uniform sampler2D grass_5_texture;
uniform sampler2D grass_6_texture;
uniform sampler2D grass_7_texture;
uniform sampler2D grass_8_texture;
uniform sampler2D grass_9_texture;
uniform sampler2D grass_10_texture;
uniform sampler2D grass_11_texture;
uniform sampler2D grass_12_texture;
uniform sampler2D grass_13_texture;
uniform sampler2D grass_14_texture;
uniform sampler2D grass_15_texture;

varying vec2 texCoord;
varying float layer;

void main(void) {
  vec4 color;
  int ilayer = int(layer);

  // pick the texture ilayer
  if (ilayer == 0) {
    color = texture2D(grass_0_texture, texCoord);
  } else if (ilayer == 1) {
    color = texture2D(grass_1_texture, texCoord);
  } else if (ilayer == 2) {
    color = texture2D(grass_2_texture, texCoord);
  } else if (ilayer == 3) {
    color = texture2D(grass_3_texture, texCoord);
  } else if (ilayer == 4) {
    color = texture2D(grass_4_texture, texCoord);
  } else if (ilayer == 5) {
    color = texture2D(grass_5_texture, texCoord);
  } else if (ilayer == 6) {
    color = texture2D(grass_6_texture, texCoord);
  } else if (ilayer == 7) {
    color = texture2D(grass_7_texture, texCoord);
  } else if (ilayer == 8) {
    color = texture2D(grass_8_texture, texCoord);
  } else if (ilayer == 9) {
    color = texture2D(grass_9_texture, texCoord);
  } else if (ilayer == 10) {
    color = texture2D(grass_10_texture, texCoord);
  } else if (ilayer == 11) {
    color = texture2D(grass_11_texture, texCoord);
  } else if (ilayer == 12) {
    color = texture2D(grass_12_texture, texCoord);
  } else if (ilayer == 13) {
    color = texture2D(grass_13_texture, texCoord);
  } else if (ilayer == 14) {
    color = texture2D(grass_14_texture, texCoord);
  } else if (ilayer == 15) {
    color = texture2D(grass_15_texture, texCoord);
  }
  gl_FragColor = color;
}
