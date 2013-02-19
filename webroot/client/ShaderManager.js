define([
    'client/Shader',
    'client/ShaderData'
  ],
  function(Shader, ShaderData) {
    return {
      shaders: {},

      getShader: function(name) {
        if (!this.shaders.hasOwnProperty(name)) {
          this.load(name);
        }
        return this.shaders[name];
      },

      load: function(name) {
        var vertexShader = this.createShader(
          this.getSource('/client/shaders/' + name + '-vs.glsl'),
          gl.VERTEX_SHADER
        );
        var fragmentShader = this.createShader(
          this.getSource('/client/shaders/' + name + '-fs.glsl'),
          gl.FRAGMENT_SHADER
        );
        var program = this.createProgram(vertexShader, fragmentShader);
        this.shaders[name] = new Shader(program);
        this.shaders[name].addAttributes(ShaderData[name].attributes);
        this.shaders[name].addUniforms(ShaderData[name].uniforms);
      },

      getSource: function(url) {
        var source;
        $.ajax({
          async: false,
          url: url,
          success: function(data) {
            source = data;
          }
        });
        return source;
      },

      createShader: function(source, type) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.log('Compile failed: ' + name);
          return null;
        }
        return shader;
      },

      createProgram: function(vertexShader, fragmentShader) {
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          console.log('Could not initialize shaders');
          return null;
        }
        return program;
      }
    };
  }
);
