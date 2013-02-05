var ShaderData = {
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
  }
};
