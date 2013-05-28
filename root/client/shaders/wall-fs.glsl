// Copyright (c) Venzio 2013 All Rights Reserved

precision mediump float;

uniform sampler2D wood_texture;
uniform int build_state;

varying vec2 texCoord;

void main(void) {
  vec4 color = texture2D(wood_texture, texCoord);
  if (build_state == 1) { // not built, but buildable
    color.w = 0.9;
  } else if (build_state == 2) { // not built, not buildable
    color.x = min(color.x + 0.2, 1.0);
    color.w = 0.9;
  }
  gl_FragColor = color;
}

