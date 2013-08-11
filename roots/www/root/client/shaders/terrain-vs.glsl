// Copyright (c) Venzio 2013 All Rights Reserved

precision mediump float;

attribute vec3 aPosition;
attribute vec3 aNormal;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNormalMatrix;
uniform float uTerrainQuality;

varying vec2 vTextureCoord;
varying float vHeight;
varying vec3 vLighting;

void main(void) {
  gl_Position = uPMatrix * uMVMatrix * vec4(aPosition, 1.0);

  vec3 ambientLight = vec3(0.2, 0.2, 0.2);
  vec3 directionalLight = vec3(1.0, 0.5, 0.5);
  vec3 directionalLightDirection = vec3(0.8, 0.7, 0.6);

  vec4 transformedNormal = uNormalMatrix * vec4(aNormal, 1.0);
  float directional = max(dot(transformedNormal.xyz, directionalLightDirection), 0.0);
  vLighting = ambientLight + (directionalLight * directional);

  vTextureCoord = vec2(aPosition.x / uTerrainQuality, aPosition.z / uTerrainQuality);
  vHeight = aPosition.y;
}
