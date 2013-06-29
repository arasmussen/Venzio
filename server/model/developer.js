// Copyright (c) Venzio 2013 All Rights Reserved

define(['mongoose'], function(mongoose) {
  var schema = mongoose.Schema({
    username: String,
    password: String,
    name: String,
    created: Date
  });
  return mongoose.model('developer', schema);
});
