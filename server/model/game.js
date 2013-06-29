// Copyright (c) Venzio 2013 All Rights Reserved

define(['mongoose'], function(mongoose) {
  var schema = mongoose.Schema({
    name: String,
    developerID: String,
    launched: Date
  });
  return mongoose.model('game', schema);
});
