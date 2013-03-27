define(['basejs'], function(Base) {
  return Base.extend({
    constructor: function(program) {
      this.program = program;
      this.attributes = [];
      this.uniforms = [];
    },

    getAttribute: function(attr) {
      return this.program[attr];
    },

    getUniform: function(uni) {
      return this.program[uni];
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
      uniforms.forEach(function(uniform) {
        this.program[uniform] = gl.getUniformLocation(this.program, uniform);
      }, this);
      this.uniforms = uniforms;
    }
  });
});
