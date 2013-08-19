// Copyright (c) Venzio 2013 All Rights Reserved

attribute vec4 aPosition;
attribute vec3 aNormal;

// since we don't have attribute arrays...
attribute float aBoneIndex1;
attribute float aBoneIndex2;
attribute float aBoneIndex3;
attribute float aBoneIndex4;
attribute float aBoneIndex5;
attribute float aBoneWeight1;
attribute float aBoneWeight2;
attribute float aBoneWeight3;
attribute float aBoneWeight4;
attribute float aBoneWeight5;

uniform mat4 uBoneMatrices[3];

uniform mat4 uInvBindMatrices[3];
uniform mat4 uWorldMatrices[3];

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNormalMatrix;

varying vec3 vLighting;

mat4 GetMatrix(in int index) {
  return uInvBindMatrices[index] * uWorldMatrices[index];
}

void main(void) {
  vec4 vertex = vec4(0.0, 0.0, 0.0, 0.0);
  vertex += aBoneWeight1 * vec4(GetMatrix(int(aBoneIndex1)) * aPosition);
  vertex += aBoneWeight2 * vec4(GetMatrix(int(aBoneIndex2)) * aPosition);
  vertex += aBoneWeight3 * vec4(GetMatrix(int(aBoneIndex3)) * aPosition);
  vertex += aBoneWeight4 * vec4(GetMatrix(int(aBoneIndex4)) * aPosition);
  vertex += aBoneWeight5 * vec4(GetMatrix(int(aBoneIndex5)) * aPosition);

  vec3 normal = vec3(0.0, 0.0, 0.0);
  normal += aBoneWeight1 * vec3(GetMatrix(int(aBoneIndex1)) * vec4(aNormal, 1.0));
  normal += aBoneWeight2 * vec3(GetMatrix(int(aBoneIndex2)) * vec4(aNormal, 1.0));
  normal += aBoneWeight3 * vec3(GetMatrix(int(aBoneIndex3)) * vec4(aNormal, 1.0));
  normal += aBoneWeight4 * vec3(GetMatrix(int(aBoneIndex4)) * vec4(aNormal, 1.0));
  normal += aBoneWeight5 * vec3(GetMatrix(int(aBoneIndex5)) * vec4(aNormal, 1.0));

  vec3 ambientLight = vec3(0.2, 0.2, 0.2);
  vec3 directionalLight = vec3(1.0, 0.7, 0.7);
  vec3 directionalLightDirection = normalize(vec3(3.0, 3.0, 0.0));

  vec4 transformedNormal = uNormalMatrix * vec4(normal, 1.0);
  float directional = max(dot(normal, directionalLightDirection), 0.0);
  vLighting = ambientLight + (directionalLight * directional);

  gl_Position = uPMatrix * uMVMatrix * vec4(vertex.xyz / 90.0, 1.0);
}
