// Copyright (c) Venzio 2013 All Rights Reserved

var uniformMatrix4fvNoTranspose = function(location, values) {
  gl.uniformMatrix4fv(location, false, values);
};

// there must be a better way than this.

var uniform1i = function(location, values) {
  gl.uniform1i(location, values);
};

var uniform1f = function(location, values) {
  gl.uniform1f(location, values);
};

define(function() {
  return {
    color: {
      attributes: [
        'Position',
        'Color'
      ],
      uniforms: [
        {
          name: 'MVMatrix',
          type: uniformMatrix4fvNoTranspose
        },
        {
          name: 'PMatrix',
          type: uniformMatrix4fvNoTranspose
        }
      ],
      textures: []
    },
    man: {
      attributes: [
        'Position',
        'Normal',
        'BoneIndex1',
        'BoneIndex2',
        'BoneIndex3',
        'BoneIndex4',
        'BoneIndex5',
        'BoneIndex6',
        'BoneIndex7',
        'BoneWeight1',
        'BoneWeight2',
        'BoneWeight3',
        'BoneWeight4',
        'BoneWeight5',
        'BoneWeight6',
        'BoneWeight7'
      ],
      uniforms: [
        {
          name: 'MVMatrix',
          type: uniformMatrix4fvNoTranspose
        },
        {
          name: 'PMatrix',
          type: uniformMatrix4fvNoTranspose
        },
        {
          name: 'NormalMatrix',
          type: uniformMatrix4fvNoTranspose
        },
        {
          name: 'BoneMatrices',
          type: uniformMatrix4fvNoTranspose
        }
      ],
      textures: []
    },
    skeleton: {
      attributes: [
        'JointPosition'
      ],
      uniforms: [
        {
          name: 'MVMatrix',
          type: uniformMatrix4fvNoTranspose
        },
        {
          name: 'PMatrix',
          type: uniformMatrix4fvNoTranspose
        }
      ],
      textures: []
    },
    cube: {
      attributes: [
        'Position',
        'TextureCoord'
      ],
      uniforms: [
        {
          name: 'MVMatrix',
          type: uniformMatrix4fvNoTranspose
        },
        {
          name: 'PMatrix',
          type: uniformMatrix4fvNoTranspose
        },
      ],
      textures: []
    },
    wall: {
      attributes: [
        'Position',
        'TextureCoord'
      ],
      uniforms: [
        {
          name: 'MVMatrix',
          type: uniformMatrix4fvNoTranspose
        },
        {
          name: 'PMatrix',
          type: uniformMatrix4fvNoTranspose
        },
        {
          name: 'BuildState',
          type: uniform1i
        }
      ],
      textures: [
        'wood'
      ]
    },
    terrain: {
      attributes: [
        'Position',
        'Normal'
      ],
      uniforms: [
        {
          name: 'MVMatrix',
          type: uniformMatrix4fvNoTranspose
        },
        {
          name: 'PMatrix',
          type: uniformMatrix4fvNoTranspose
        },
        {
          name: 'NormalMatrix',
          type: uniformMatrix4fvNoTranspose
        },
        {
          name: 'TerrainQuality',
          type: uniform1f
        }
      ],
      textures: [
        'dirt',
        'grass',
        'snow'
      ]
    },
    grass: {
      attributes: [
        'Position',
        'TextureCoord',
        'Layer'
      ],
      uniforms: [
        {
          name: 'MVMatrix',
          type: uniformMatrix4fvNoTranspose
        },
        {
          name: 'PMatrix',
          type: uniformMatrix4fvNoTranspose
        }
      ],
      textures: [
        'grass'
      ]
    }
  };
});
