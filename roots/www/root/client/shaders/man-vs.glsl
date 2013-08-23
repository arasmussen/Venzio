// Copyright (c) Venzio 2013 All Rights Reserved

attribute vec4 aPosition;
attribute vec3 aNormal;

// since we don't have attribute arrays...
attribute float aBoneIndex1;
attribute float aBoneIndex2;
attribute float aBoneIndex3;
attribute float aBoneIndex4;
attribute float aBoneIndex5;
attribute float aBoneIndex6;
attribute float aBoneIndex7;
attribute float aBoneWeight1;
attribute float aBoneWeight2;
attribute float aBoneWeight3;
attribute float aBoneWeight4;
attribute float aBoneWeight5;
attribute float aBoneWeight6;
attribute float aBoneWeight7;

uniform mat4 uBoneMatrices[52];

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNormalMatrix;

varying vec3 vLighting;

mat4 getSkinMatrix() {
  return
    aBoneWeight1 * uBoneMatrices[int(aBoneIndex1)] +
    aBoneWeight2 * uBoneMatrices[int(aBoneIndex2)] +
    aBoneWeight3 * uBoneMatrices[int(aBoneIndex3)] +
    aBoneWeight4 * uBoneMatrices[int(aBoneIndex4)] +
    aBoneWeight5 * uBoneMatrices[int(aBoneIndex5)] +
    aBoneWeight6 * uBoneMatrices[int(aBoneIndex6)] +
    aBoneWeight7 * uBoneMatrices[int(aBoneIndex7)];
}

// simply transpose
mat3 getNormalMatrix(in mat4 skin_matrix) {
  return mat3(
    skin_matrix[0][0], skin_matrix[1][0], skin_matrix[2][0],
    skin_matrix[0][1], skin_matrix[1][1], skin_matrix[2][1],
    skin_matrix[0][2], skin_matrix[1][2], skin_matrix[2][2]
  );
}

void main(void) {
  mat4 skin_matrix = getSkinMatrix();
  vec4 position = skin_matrix * aPosition;
  vec3 normal = normalize(aNormal * getNormalMatrix(skin_matrix));

  vec3 ambientLight = vec3(0.2, 0.2, 0.2);
  vec3 directionalLight = vec3(1.0, 0.7, 0.7);
  vec3 directionalLightDirection = normalize(vec3(3.0, 3.0, 0.0));

  vec4 transformedNormal = uNormalMatrix * vec4(normal, 1.0);
  float directional = max(dot(normal, directionalLightDirection), 0.0);
  vLighting = ambientLight + (directionalLight * directional);

  gl_Position = uPMatrix * uMVMatrix * vec4(position.xyz, 1.0);
}
