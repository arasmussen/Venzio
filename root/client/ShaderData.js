define(function() {
  return {
    color: {
      attributes: [
        'Position',
        'Color'
      ],
      uniforms: [
        'uMVMatrix',
        'uPMatrix'
      ]
    },
    cube: {
      attributes: [
        'Position',
        'TextureCoord'
      ],
      uniforms: [
        'uMVMatrix',
        'uPMatrix'
      ]
    },
    terrain: {
      attributes: [
        'Position',
        'TextureCoord'
      ],
      uniforms: [
        'uMVMatrix',
        'uPMatrix',
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
      uniforms: [
        'uMVMatrix',
        'uPMatrix',
        'grass_0_texture',
        'grass_1_texture',
        'grass_2_texture',
        'grass_3_texture',
        'grass_4_texture',
        'grass_5_texture',
        'grass_6_texture',
        'grass_7_texture',
        'grass_8_texture',
        'grass_9_texture',
        'grass_10_texture',
        'grass_11_texture',
        'grass_12_texture',
        'grass_13_texture',
        'grass_14_texture',
        'grass_15_texture'
      ]
    }
  };
});
