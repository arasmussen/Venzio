// Copyright (c) Venzio 2013 All Rights Reserved

precision mediump float;

attribute vec3 Position;
attribute vec2 TextureCoord;
attribute vec3 Normal;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNormalMatrix;

varying vec2 texCoord;
varying float y;
varying vec3 lighting;

void main(void) {
  gl_Position = uPMatrix * uMVMatrix * vec4(Position, 1.0);

  vec3 ambientLight = vec3(0.2, 0.2, 0.2);
  vec3 directionalLight = vec3(1.0, 0.5, 0.5);
  vec3 directionalLightDirection = vec3(0.8, 0.7, 0.6);

  vec4 transformedNormal = uNormalMatrix * vec4(Normal, 1.0);
  float directional = max(dot(transformedNormal.xyz, directionalLightDirection), 0.0);
  lighting = ambientLight + (directionalLight * directional);

  texCoord = TextureCoord;
  y = Position.y;
}
