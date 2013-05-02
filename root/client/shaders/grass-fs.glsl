// Copyright (c) Venzio 2013 All Rights Reserved

precision mediump float;

uniform sampler2D grass_texture;

varying vec2 texCoord;
varying float layer;

void main(void) {
  vec4 pixel = texture2D(grass_texture, texCoord);
  if (pixel.x > 0.2 + (layer / 20.0)) {
    gl_FragColor = vec4(0.0, 0.5, 0.0, 1.0);
  } else {
    gl_FragColor = vec4(0.0, 0.5, 0.0, 0.0);
  }
}
