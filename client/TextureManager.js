var TextureManager = {
  textures: {},

  getTexture: function(name, filetype) {
    if (!this.textures.hasOwnProperty(name)) {
      this.textures[name] = {};
      this.textures[name].texture = gl.createTexture();
      this.textures[name].loaded = false;
      this.textures[name].image = new Image();
      this.textures[name].image.onload = this.onTextureLoaded.bind(this, name);
      this.textures[name].image.src = '/textures/' + name + '.' + filetype;
    }
    return this.textures[name];
  },

  onTextureLoaded: function(name) {
    var texture = this.textures[name];
    gl.bindTexture(gl.TEXTURE_2D, texture.texture);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(
      gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    texture.loaded = true;
  }
};
