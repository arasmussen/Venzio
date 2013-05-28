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
      attributes.forEach(function(attribute) {
        this.program[attribute] = gl.getAttribLocation(this.program, attribute);
      }, this);
      this.attributes = attributes;
    },

    addUniforms: function(uniforms) {
      this.use();
      for (var uniform in uniforms) {
        this.program[uniform] = {
          location: gl.getUniformLocation(this.program, uniform),
          type: uniform.type
        };
      }
      this.uniforms = uniforms;
    },

    addTextures: function(textures) {
      this.use();
      textures.forEach(function(texture) {
        this.program[texture] = gl.getUniformLocation(this.program, texture);
      }, this);
      this.textures = textures;
    }
  });
});
