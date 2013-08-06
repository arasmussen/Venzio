// Copyright (c) Venzio 2013 All Rights Reserved

attribute vec3 aPosition;
attribute vec3 aNormal;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNormalMatrix;

varying vec3 vLighting;

void main(void) {
  vec3 ambientLight = vec3(0.2, 0.2, 0.2);
  vec3 directionalLight = vec3(1.0, 0.7, 0.7);
  vec3 directionalLightDirection = normalize(vec3(3.0, 3.0, 0.0));

  vec4 transformedNormal = uNormalMatrix * vec4(aNormal, 1.0);
  float directional = max(dot(aNormal, directionalLightDirection), 0.0);
  vLighting = ambientLight + (directionalLight * directional);

  gl_Position = uPMatrix * uMVMatrix * vec4(aPosition / 80.0, 1.0);
}
