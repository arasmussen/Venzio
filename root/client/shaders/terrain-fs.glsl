// Copyright (c) Venzio 2013 All Rights Reserved

precision mediump float;

uniform sampler2D dirt_texture;
uniform sampler2D grass_texture;
uniform sampler2D snow_texture;

varying vec2 texCoord;
varying float y;
varying vec3 lighting;

void main(void) {
  vec4 dirt = texture2D(dirt_texture, texCoord);
  vec4 grass = texture2D(grass_texture, texCoord);
  vec4 snow = texture2D(snow_texture, texCoord);

  if (y < -5.0) {
    gl_FragColor = dirt;
  } else if (y < 0.0) {
    gl_FragColor = mix(dirt, grass, (y + 5.0) / 5.0);
  } else if (y < 2.0) {
    gl_FragColor = grass;
  } else if (y < 8.0) {
    gl_FragColor = mix(grass, snow, (y - 2.0) / 6.0);
  } else {
    gl_FragColor = snow;
  }

  gl_FragColor = vec4(gl_FragColor.rgb * lighting, gl_FragColor.a);
}
