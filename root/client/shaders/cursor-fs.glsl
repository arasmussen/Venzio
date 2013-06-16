// Copyright (c) Venzio 2013 All Rights Reserved

precision mediump float;

uniform sampler2D uCursorTexture;

varying vec2 vTextureCoord;

void main(void) {
  if (texture2D(uCursorTexture, vTextureCoord).w > 0.21) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  } else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
  }
}
