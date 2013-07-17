define([
    'mongoose',
    'server/LocalConfig'
  ], function(mongoose, config) {
  return {
    db: null,
    mongoose: mongoose,

    connect: function() {
      var username = config.DBUSERNAME;
      var password = config.DBPASSWORD;
      var host = config.DBHOST;
      var port = config.DBPORT;
      var name = config.DBNAME;
      var connectionString = 'mongodb://' + username + ':' + password + '@' + host + ':' + port + '/' + name;
      mongoose.connect(connectionString);
      this.db = mongoose.connection;
      this.db.on('error', console.error.bind(console, 'connection error:'));
      this.db.once('open', this.success.bind(this));
    },

    success: function() {
      console.log('db successfully connected');
    }
  };
});
