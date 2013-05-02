// Copyright (c) Venzio 2013 All Rights Reserved

attribute vec3 Position;
attribute vec2 TextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec2 texCoord;

void main(void) {
  gl_Position = uPMatrix * uMVMatrix * vec4(Position, 1.0);
  texCoord = TextureCoord;
}
