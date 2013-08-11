// Copyright (c) Venzio 2013 All Rights Reserved

var time = (new Date()).getTime();
requirejs.config({
  baseUrl: '.',
  urlArgs: 'bust=' + time,
  paths: {
    basejs: 'common/lib/third-party/Base',
    lib: 'client/lib'
  }
});

requirejs(['client/main'], function(main) {
  main();
});
