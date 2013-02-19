define(['shared/Globals', 'client/lib/socket.io'], function(Globals, io) {
  return {
    address: Globals.address,
    connected: false,
    port: Globals.port,
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

      console.log(msg);
      this.socket.emit('input', {
        id: this.id,
        msg: msg
      });
    }
  };
});
