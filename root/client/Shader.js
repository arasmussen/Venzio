// Copyright (c) Venzio 2013 All Rights Reserved

define(['basejs'], function(Base) {
  return Base.extend({
    constructor: function(program) {
      this.program = program;
      this.attributes = [];
      this.uniforms = [];
      this.textures = [];
    },

    getAttribute: function(attr) {
      return this.program[attr];
    },

    getUniform: function(uni) {
      return this.program[uni].location;
    },

    getTexture: function(texture) {
      return this.program[texture];
    },

    use: function() {
      gl.useProgram(this.program);
    },

    enableAttributes: function() {
      this.attributes.forEach(function(attribute) {
        gl.enableVertexAttribArray(this.program[attribute]);
      }, this);
    },

    disableAttributes: function() {
      this.attributes.forEach(function(attribute) {
        gl.disableVertexAttribArray(this.program[attribute]);
      }, this);
    },

    preDraw: function() {
      this.use();
      this.enableAttributes();
    },

    postDraw: function() {
      this.disableAttributes();
    },

    addAttributes: function(attributes) {
      this.use();
      for (var i = 0; i < attributes.length; i++) {
        var attribute = attributes[i];
        this.program[attribute] = gl.getAttribLocation(this.program, 'a' + attribute);
      }
      this.attributes = attributes;
    },

    addUniforms: function(uniforms) {
      this.use();
      for (var i = 0; i < uniforms.length; i++) {
        var uniform = uniforms[i];
        this.program[uniform.name] = {
          location: gl.getUniformLocation(this.program, 'u' + uniform.name),
          type: uniform.type
        };
      }
      this.uniforms = uniforms;
    },

    addTextures: function(textures) {
      this.use();
      for (var i = 0; i < textures.length; i++) {
        var texture = textures[i];
        var name = 'u' + texture.charAt(0).toUpperCase() + texture.slice(1) + 'Texture';
        this.program[texture] = gl.getUniformLocation(this.program, name);
      }
      this.textures = textures;
    }
  });
});
