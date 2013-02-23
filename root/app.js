requirejs.config({
  baseUrl: '.',
  urlArgs: 'bust=' + (new Date()).getTime(),
  paths: {
    basejs: 'client/lib/Base',
    client: 'client',
    lib: 'client/lib',
    physics: 'shared/physics',
    shared: 'shared'
  }
});

requirejs(['client/main'], function(main) {
  main();
});
