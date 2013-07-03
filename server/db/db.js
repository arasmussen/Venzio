define(['mongoose'], function(mongoose) {
  return {
    db: null,
    mongoose: mongoose,

    connect: function() {
      var username = process.env.VENZIO_DB_USER;
      var password = process.env.VENZIO_DB_PASS;
      var host = process.env.VENZIO_DB_HOST;
      var port = process.env.VENZIO_DB_PORT;
      var name = process.env.VENZIO_DB_NAME;
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
