// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'endpoint/Heightmap',
    'endpoint/Payment',
    'endpoint/PlayerLogin',
    'endpoint/CreatePlayer',
    'endpoint/Logout',
    'endpoint/DeveloperSubscribe',
  ],
  function(
    HeightmapEndpoint,
    PaymentEndpoint,
    LoginPlayerEndpoint,
    CreatePlayerEndpoint,
    LogoutEndpoint,
    DeveloperSubscribeEndpoint
  ) {
    return {
      cssFiles: {
        '/index': ['index'],
        '/demo': ['demo'],
        '/jobs': ['jobs'],
        '/thanks': ['acknowledge'],
        '/sorry': ['acknowledge']
      },

      endpoints: {
        '/heightmap': HeightmapEndpoint,
        '/charge': PaymentEndpoint,
        '/playerLogin': LoginPlayerEndpoint,
        '/createPlayer': CreatePlayerEndpoint,
        '/logout': LogoutEndpoint,
        '/developerSubscribe': DeveloperSubscribeEndpoint
      },

      // loads B when A is requested
      aliases: {
        '/': '/index',
        '/favicon.ico': '/img/favicon.ico'
      },

      // sends a 302 redirect from A to B
      redirects: {
      }
    };
  }
);
