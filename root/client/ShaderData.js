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
        'grass_texture'
      ]
    }
  };
});
