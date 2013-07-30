// Copyright (c) Venzio 2013 All Rights Reserved

precision mediump float;

uniform sampler2D uWoodTexture;
uniform int uBuildState;

varying vec2 vTextureCoord;

void main(void) {
  vec4 color = texture2D(uWoodTexture, vTextureCoord);
  if (uBuildState == 1) { // not built, but buildable
    color.w = 0.9;
  } else if (uBuildState == 2) { // not built, not buildable
    color.x = min(color.x + 0.2, 1.0);
    color.w = 0.9;
  }
  gl_FragColor = color;
}

