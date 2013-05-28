// Copyright (c) Venzio 2013 All Rights Reserved

var uniformMatrix4fvNoTranspose = function(location, values) {
  gl.uniformMatrix4fv(location, false, values);
};

// above might be necessary but there must be a better way than this.
var uniform1i = function(location, values) {
  gl.uniform1i(location, values);
};

define(function() {
  return {
    color: {
      attributes: [
        'Position',
        'Color'
      ],
      uniforms: {
        'uMVMatrix': {
          type: uniformMatrix4fvNoTranspose
        },
        'uPMatrix': {
          type: uniformMatrix4fvNoTranspose
        }
      },
      textures: []
    },
    cube: {
      attributes: [
        'Position',
        'TextureCoord'
      ],
      uniforms: {
        'uMVMatrix': {
          type: uniformMatrix4fvNoTranspose
        },
        'uPMatrix': {
          type: uniformMatrix4fvNoTranspose
        },
      },
      textures: []
    },
    wall: {
      attributes: [
        'Position',
        'TextureCoord'
      ],
      uniforms: {
        'uMVMatrix': {
          type: uniformMatrix4fvNoTranspose
        },
        'uPMatrix': {
          type: uniformMatrix4fvNoTranspose
        },
        'build_state': {
          type: uniform1i
        }
      },
      textures: [
        'wood_texture'
      ]
    },
    terrain: {
      attributes: [
        'Position',
        'TextureCoord'
      ],
      uniforms: {
        'uMVMatrix': {
          type: uniformMatrix4fvNoTranspose
        },
        'uPMatrix': {
          type: uniformMatrix4fvNoTranspose
        }
      },
      textures: [
        'dirt_texture',
        'grass_texture',
        'snow_texture'
      ]
    },
    grass: {
      attributes: [
        'Position',
        'TextureCoord',
        'Layer'
      ],
      uniforms: {
        'uMVMatrix': {
          type: uniformMatrix4fvNoTranspose
        },
        'uPMatrix': {
          type: uniformMatrix4fvNoTranspose
        },
      },
      textures: [
        'grass_texture'
      ]
    }
  };
});
