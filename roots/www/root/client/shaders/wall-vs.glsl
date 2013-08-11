// Copyright (c) Venzio 2013 All Rights Reserved

attribute vec3 aPosition;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec2 vTextureCoord;

void main(void) {
  gl_Position = uPMatrix * uMVMatrix * vec4(aPosition, 1.0);
  vTextureCoord = aTextureCoord;
}
