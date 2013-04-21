define([
    'basejs'
  ],
  function(Base) {
    return Base.extend({
      constructor: function() {
        this.walls = [];
      },

      add: function(wall) {
        this.walls.push(wall);
      },

      drawWalls: function() {
        for (var i in this.walls) {
          this.walls[i].draw();
        }
      }
    });
  }
);
