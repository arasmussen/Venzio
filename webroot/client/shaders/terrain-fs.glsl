precision mediump float;

uniform sampler2D dirt_texture;
uniform sampler2D grass_texture;
uniform sampler2D snow_texture;

varying vec2 texCoord;
varying float y;

void main(void) {
  if (y < -5.0) {
    gl_FragColor = texture2D(dirt_texture, texCoord);
  } else if (y < 0.0) {
    gl_FragColor = mix(
      texture2D(dirt_texture, texCoord),
      texture2D(grass_texture, texCoord),
      (y + 5.0) / 5.0
    );
  } else if (y < 3.0) {
    gl_FragColor = texture2D(grass_texture, texCoord);
  } else if (y < 5.0) {
    gl_FragColor = mix(
      texture2D(grass_texture, texCoord),
      texture2D(snow_texture, texCoord),
      (y - 3.0) / 2.0
    );
  } else {
    gl_FragColor = texture2D(snow_texture, texCoord);
  }
}
