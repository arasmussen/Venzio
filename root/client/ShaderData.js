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
        'grass_130_texture',
        'grass_135_texture',
        'grass_140_texture',
        'grass_145_texture',
        'grass_150_texture',
        'grass_155_texture',
        'grass_160_texture',
        'grass_165_texture',
        'grass_170_texture',
        'grass_175_texture'
      ]
    }
  };
});
