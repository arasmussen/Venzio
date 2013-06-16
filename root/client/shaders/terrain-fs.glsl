// Copyright (c) Venzio 2013 All Rights Reserved

precision mediump float;

uniform sampler2D uDirtTexture;
uniform sampler2D uGrassTexture;
uniform sampler2D uSnowTexture;

varying vec2 vTextureCoord;
varying float vHeight;
varying vec3 vLighting;

void main(void) {
  vec4 dirt = texture2D(uDirtTexture, vTextureCoord);
  vec4 grass = texture2D(uGrassTexture, vTextureCoord);
  vec4 snow = texture2D(uSnowTexture, vTextureCoord);

  if (vHeight < -5.0) {
    gl_FragColor = dirt;
  } else if (vHeight < 0.0) {
    gl_FragColor = mix(dirt, grass, (vHeight + 5.0) / 5.0);
  } else if (vHeight < 2.0) {
    gl_FragColor = grass;
  } else if (vHeight < 8.0) {
    gl_FragColor = mix(grass, snow, (vHeight - 2.0) / 6.0);
  } else {
    gl_FragColor = snow;
  }

  gl_FragColor = vec4(gl_FragColor.rgb * vLighting, gl_FragColor.a);
}
