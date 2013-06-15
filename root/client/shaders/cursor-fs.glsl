// Copyright (c) Venzio 2013 All Rights Reserved

precision mediump float;

uniform sampler2D cursor_texture;

varying vec2 texCoord;

void main(void) {
  if (texture2D(cursor_texture, texCoord).w > 0.21) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  } else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
  }
}
