define(['mongoose'], function(mongoose) {
  return {
    db: null,

    connect: function() {
      mongoose.connect('mongodb://localhost/gfx');
      this.db = mongoose.connection;
      this.db.on('error', this.error.bind(this));
      this.db.once('open', this.success.bind(this));
    },

    error: function(msg) {
      console.error('connection error:', msg);
    },

    success: function() {
      console.log('db successfully connected');
    }
  };
});
