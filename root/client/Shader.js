define(['basejs'], function(Base) {
  return Base.extend({
    constructor: function(program) {
      this.program = program;
      this.attributes = [];
    },

    use: function() {
      gl.useProgram(this.program);
    },

    getAttribute: function(attr) {
      return this.program[attr];
    },

    getUniform: function(uni) {
      return this.program[uni];
    },

    getAttributes: function() {
      return this.attributes;
    },

    addAttributes: function(attrs) {
      this.use();
      attrs.forEach(function(attr) {
        this.program[attr] = gl.getAttribLocation(this.program, attr);
        gl.enableVertexAttribArray(this.program[attr]);
      }, this);
      this.attributes = attrs;
    },

    addUniforms: function(unis) {
      this.use();
      unis.forEach(function(uni) {
        this.program[uni] = gl.getUniformLocation(this.program, uni);
      }, this);
    }
  });
});
