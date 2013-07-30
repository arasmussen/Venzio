// Copyright (c) Venzio 2013 All Rights Reserved

define(function() {
  return {
    initLoadCount: 0,

    textures: {},

    initialTextures: [
      {name: 'wood', filetype: 'jpeg'},
      {name: 'dirt', filetype: 'jpg'},
      {name: 'grass', filetype: 'jpg'},
      {name: 'snow', filetype: 'png'}
    ],

    initialize: function(callback) {
      this.initCallback = callback;
      this.initLoadCount = this.initialTextures.length;
      for (var i in this.initialTextures) {
        this.getTexture(this.initialTextures[i].name, this.initialTextures[i].filetype, this.initOnLoaded.bind(this));
      }
    },

    initOnLoaded: function() {
      if (--this.initLoadCount == 0) {
        this.initCallback();
      }
    },

    getTexture: function(name, filetype, callback) {
      if (!this.textures.hasOwnProperty(name)) {
        this.textures[name] = {};
        this.textures[name].texture = gl.createTexture();
        this.textures[name].loaded = false;
        this.textures[name].image = new Image();
        this.textures[name].image.onload = this.onTextureLoaded.bind(this, name);
        this.textures[name].image.src = '/client/textures/' + name + '.' + filetype;
        this.textures[name].callback = callback;
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
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.bindTexture(gl.TEXTURE_2D, null);
      texture.loaded = true;

      if (texture.callback !== undefined) {
        texture.callback();
      }
    }
  };
});
