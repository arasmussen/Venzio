// Copyright (c) Venzio 2013 All Rights Reserved

{
  // loads B when A is requested
  aliases: {
    '/': '/index',
    '/favicon.ico': '/img/favicon.ico',
  },

  cssFiles: {
    '/index': ['index'],
    '/signup': ['form'],
  },

  // sends a 302 redirect from A to B
  redirects: {
  }
}
