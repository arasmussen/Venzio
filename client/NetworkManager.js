var NetworkManager = {
  address: 'http://gfx.rasmuzen.com',
  connected: false,
  port: 8080,
  socket: null,

  initialize: function() {
    this.socket = new io.connect(this.address, {port: this.port});
    this.socket.on('message', this.onServerMessage.bind(this));
  },

  onServerMessage: function(data) {
  },

  sendMessage: function(msg) {
    this.socket.send(msg);
  }
};
