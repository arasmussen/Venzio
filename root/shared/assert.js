define(function() {
  return function(condition, message) {
    if (!condition) {
      throw message;
    }
  }
});
