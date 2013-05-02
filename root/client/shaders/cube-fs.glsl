// Copyright (c) Venzio 2013 All Rights Reserved

precision mediump float;

uniform sampler2D wood_texture;

varying vec2 texCoord;

void main(void) {
  gl_FragColor = texture2D(wood_texture, texCoord);
}
