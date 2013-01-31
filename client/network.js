var network = {
  dgram: require('dgram'),
  server: dgram.createSocket('udp4'),
  port: 8080,
  address: 'http://gfx.rasmuzen.com',

  callback: function(err, bytes) {
    console.log({err: err, bytes: bytes});
  },

  send: function(data) {
    var json = JSON.stringify(data);
    var buffer = new ArrayBuffer(json.length * 2);
    var buffer_view = new Uint16Array(buffer);
    for (var i = 0; i < json.length; i++) {
      buffer_view[i] = json.charCodeAt(i);
    }
    server.send(
      buffer,
      0,
      buffer.length,
      8080,
      'http://gfx.rasmuzen.com',
      this.callback
    );
  },

  receive: function(data) {
  }
};
