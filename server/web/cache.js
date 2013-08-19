// Copyright (c) Venzio 2013 All Rights Reserved

define(['fs', 'server/LocalConfig'],
  function(fs, config) {
    // bypass cache for dev environment
    var dev;
    if (!config) {
      dev = true;
    } else {
      dev = (config.environment == 'dev');
    }

    return {
      data: {},

      getFile: function(filepath, encoding, callback) {
        // resolve to realpath
        filepath = fs.realpathSync(filepath);

        if (dev || !this.data.hasOwnProperty(filepath)) {
          fs.readFile(filepath, encoding, function(err, data) {
            if (err) {
              console.error('cache: err on ' + filepath);
              callback(err, data);
            } else {
              if (!dev) {
                this.data[filepath] = data;
              }
              callback(null, data);
            }
          }.bind(this));
        } else {
          callback(null, this.data[filepath]);
        }
      },

      getFileSync: function(filepath, encoding) {
        // resolve to realpath
        filepath = fs.realpathSync(filepath);

        if (dev || !this.data.hasOwnProperty(filepath)) {
          this.data[filepath] = fs.readFileSync(filepath, encoding);
        }
        return this.data[filepath];
      }
    }
  }
);
