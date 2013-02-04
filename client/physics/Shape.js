var Shape = Drawable.extend({
  constructor: function() {
    this.base(true);
  },

  getAttributes: function() {
    return ['Position', 'Color'];
  }
});
