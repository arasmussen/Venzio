// Copyright (c) Venzio 2013 All Rights Reserved

define(function() {
  return function(condition, message) {
    if (!condition) {
      throw message;
    }
  }
});
