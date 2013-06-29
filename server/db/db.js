define(['mongoose'], function(mongoose) {
  return {
    db: null,
    mongoose: mongoose,

    connect: function() {
      mongoose.connect('mongodb://localhost/venzio');
      this.db = mongoose.connection;
      this.db.on('error', console.error.bind(console, 'connection error:'));
      this.db.once('open', this.success.bind(this));
    },

    success: function() {
      console.log('db successfully connected');
    }
  };
});
