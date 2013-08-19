define([
    'mongoose',
    'server/LocalConfig'
  ], function(mongoose, config) {
  return {
    connected: false,
    db: null,
    mongoose: mongoose,

    connect: function() {
      if (!config || !config.db) {
        return;
      }

      var username = config.db.username;
      var password = config.db.password;
      var host = config.db.host;
      var port = config.db.port;
      var name = config.db.name;
      var connectionString = 'mongodb://' + username + ':' + password + '@' + host + ':' + port + '/' + name;
      mongoose.connect(connectionString);
      this.db = mongoose.connection;
      this.db.on('error', console.error.bind(console, 'connection error:'));
      this.db.once('open', this.success.bind(this));
    },

    success: function() {
      this.connected = true;
      console.log('db successfully connected');
    }
  };
});
