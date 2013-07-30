// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
  ], function(Base) {
    return Base.extend({
      constructor: function(id) {
        this.id = id;
        this.cursor = document.getElementById(id);
        this.state = false;
      },

      update: function(state) {
        if (this.state == state) {
          return;
        }
        this.state = state;

        if (state) {
          this.cursor.style.display = 'block';
        } else {
          this.cursor.style.display = 'none';
        }
      }
    });
  }
);

