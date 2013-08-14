// Copyright (c) Venzio 2013 All Rights Reserved

attribute vec4 aJointPosition;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

void main(void) {
  gl_Position = uPMatrix * uMVMatrix * vec4(aJointPosition.xyz / 90.0, 1.0);
  gl_PointSize = 3.0;
}
