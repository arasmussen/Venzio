precision mediump float;

uniform sampler2D dirt_texture;
uniform sampler2D grass_texture;
uniform sampler2D snow_texture;

varying vec2 texCoord;
varying float y;

void main(void) {
  vec4 dirt = texture2D(dirt_texture, texCoord);
  vec4 grass = texture2D(grass_texture, texCoord);
  vec4 snow = texture2D(snow_texture, texCoord);
  float dirt_weight = 0.0;
  float grass_weight = 0.0;
  float snow_weight = 0.0;
  if (y < -5.0) {
    dirt_weight = 1.0;
  } else if (y < 0.0) {
    grass_weight = (y + 5.0) / 5.0;
    dirt_weight = 1.0 - grass_weight;
  } else if (y < 3.0) {
    grass_weight = 1.0;
  } else if (y < 5.0) {
    snow_weight = (y - 3.0) / 2.0;
    grass_weight = 1.0 - snow_weight;
  } else {
    snow_weight = 1.0;
  }
  gl_FragColor = dirt * dirt_weight + grass * grass_weight + snow * snow_weight;
}
