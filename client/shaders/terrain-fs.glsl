precision mediump float;

uniform sampler2D dirt_texture;
uniform sampler2D grass_texture;
uniform sampler2D stone_texture;

varying vec2 texCoord;
varying float y;

void main(void) {
  if (y < -2.0) {
    gl_FragColor = texture2D(dirt_texture, texCoord);
  } else if (y < 0.0) {
    gl_FragColor = mix(
      texture2D(dirt_texture, texCoord),
      texture2D(grass_texture, texCoord),
      (y + 2.0) / 2.0
    );
  } else if (y < 2.0) {
    gl_FragColor = texture2D(grass_texture, texCoord);
  } else if (y < 4.0) {
    gl_FragColor = mix(
      texture2D(grass_texture, texCoord),
      texture2D(stone_texture, texCoord),
      (y - 2.0) / 2.0
    );
  } else {
    gl_FragColor = texture2D(stone_texture, texCoord);
  }
}
