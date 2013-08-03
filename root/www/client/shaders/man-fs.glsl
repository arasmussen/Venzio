// Copyright (c) Venzio 2013 All Rights Reserved

precision mediump float;

varying vec3 vLighting;

void main(void) {
  vec4 skin = vec4(0.8, 0.6, 0.4, 1.0);
  gl_FragColor = vec4(skin.rgb * vLighting, skin.a);
}
