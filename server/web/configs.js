// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'roots/www/config',
    'roots/space/config',
    'roots/medieval/config',
    'roots/greek/config',
    'roots/desert/config',
    'roots/three/config',
  ],
  function(www, space, medieval, greek, desert, three) {
    return {
      'www': www,
      'space': space,
      'medieval': medieval,
      'greek': greek,
      'desert': desert,
      'three': three
    };
  }
);
