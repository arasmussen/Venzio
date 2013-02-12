var NetworkManager = {
  address: globals.address,
  connected: false,
  port: globals.port,
  socket: null,

  initialize: function() {
    this.socket = new io.connect(this.address, {port: this.port});
    this.socket.on('message', this.onServerMessage.bind(this));
    this.socket.on('init', this.onServerInit.bind(this));
  },

  onServerInit: function(data) {
    this.id = data.id;
    this.connected = true;
  },

  onServerMessage: function(data) {
    if (!this.connected) {
      return;
    }
  },

  sendMessage: function(msg) {
    if (!this.connected) {
      return;
    }

    this.socket.send({
      id: this.id,
      msg: msg
    });
  }
};
