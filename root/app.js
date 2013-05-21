// Copyright (c) Venzio 2013 All Rights Reserved

requirejs.config({
  baseUrl: '.',
  urlArgs: 'bust=' + (new Date()).getTime(),
  paths: {
    basejs: 'common/lib/third-party/Base',
    lib: 'client/lib'
  }
});

requirejs(['client/main'], function(main) {
  main(true);
});
