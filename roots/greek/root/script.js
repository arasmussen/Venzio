$(function() {
  $(window).scroll(function() {
    $('#header').css('left', -$(this).scrollLeft() + 'px');
  });
});
