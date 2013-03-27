precision mediump float;

uniform sampler2D grass_130_texture;
uniform sampler2D grass_135_texture;
uniform sampler2D grass_140_texture;
uniform sampler2D grass_145_texture;
uniform sampler2D grass_150_texture;
uniform sampler2D grass_155_texture;
uniform sampler2D grass_160_texture;
uniform sampler2D grass_165_texture;
uniform sampler2D grass_170_texture;
uniform sampler2D grass_175_texture;

varying vec2 texCoord;
varying float layer;

void main(void) {
  vec4 color;
  int ilayer = int(layer);

  // pick the texture ilayer
  if (ilayer == 0) {
    color = texture2D(grass_130_texture, texCoord);
  } else if (ilayer == 1) {
    color = texture2D(grass_135_texture, texCoord);
  } else if (ilayer == 2) {
    color = texture2D(grass_140_texture, texCoord);
  } else if (ilayer == 3) {
    color = texture2D(grass_145_texture, texCoord);
  } else if (ilayer == 4) {
    color = texture2D(grass_150_texture, texCoord);
  } else if (ilayer == 5) {
    color = texture2D(grass_155_texture, texCoord);
  } else if (ilayer == 6) {
    color = texture2D(grass_160_texture, texCoord);
  } else if (ilayer == 7) {
    color = texture2D(grass_165_texture, texCoord);
  } else if (ilayer == 8) {
    color = texture2D(grass_170_texture, texCoord);
  } else if (ilayer == 9) {
    color = texture2D(grass_175_texture, texCoord);
  }

  color.w = 1.0 - (float(layer) / 100.0);

  // decide between alpha or green
  if (color.x < 0.5) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
  } else {
    gl_FragColor = vec4(0.0, 0.7, 0.0, color.w);
  }
}
