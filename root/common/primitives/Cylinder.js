// Copyright (c) Venzio 2013 All Rights Reserved

define(['basejs'], function(Base) {
  return Base.extend({
    constructor: function(bottom, radius, height) {
      this.position = bottom;
      this.radius = radius;
      this.height = height;
    }
  });
});
