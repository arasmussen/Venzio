// Copyright (c) Venzio 2013 All Rights Reserved

define(['fs'],
  function(fs) {
    return {
      data: {},

      getFile: function(filepath, encoding, callback) {
        if (!this.data.hasOwnProperty(filepath)) {
          fs.readFile(filepath, encoding, function(err, data) {
            if (err) {
              console.error('cache: err on ' + filepath);
              callback(err, data);
            } else {
              this.data[filepath] = data;
              callback(null, data);
            }
          }.bind(this));
        } else {
          callback(null, this.data[filepath]);
        }
      }
    }
  }
);
