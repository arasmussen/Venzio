// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'endpoint/Payment',
    'endpoint/PlayerLogin',
    'endpoint/CreatePlayer',
    'endpoint/Logout',
    'endpoint/DeveloperSubscribe',
    'endpoint/FakeSignup',
  ],
  function(
    PaymentEndpoint,
    LoginPlayerEndpoint,
    CreatePlayerEndpoint,
    LogoutEndpoint,
    DeveloperSubscribeEndpoint,
    FakeSignupEndpoint
  ) {
    return {
      cssFiles: {
        '/index': ['index'],
        '/demo': ['demo'],
        '/jobs': ['jobs'],
        '/thanks': ['acknowledge'],
        '/sorry': ['acknowledge'],
        '/subscribe': ['form'],
        '/unsubscribe': ['form'],
        '/signup': ['form'],
        '/login': ['form'],
      },

      endpoints: {
        '/charge': PaymentEndpoint,
        '/playerLogin': LoginPlayerEndpoint,
        '/createPlayer': CreatePlayerEndpoint,
        '/logout': LogoutEndpoint,
        '/developerSubscribe': DeveloperSubscribeEndpoint,
        '/fakeSignup': FakeSignupEndpoint,
      },

      subdomains: [
        'medieval',
        // 'www',
      ],

      // loads B when A is requested
      aliases: {
        '/': '/index',
        '/favicon.ico': '/img/favicon.ico',
      },

      // sends a 302 redirect from A to B
      redirects: {
      }
    };
  }
);
