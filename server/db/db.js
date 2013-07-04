define([
    'mongoose',
    'web/SensitiveConstants'
  ], function(mongoose, Constants) {
  return {
    db: null,
    mongoose: mongoose,

    connect: function() {
      var username = Constants.DBUSERNAME;
      var password = Constants.DBPASSWORD;
      var host = Constants.DBHOST;
      var port = Constants.DBPORT;
      var name = Constants.DBNAME;
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
