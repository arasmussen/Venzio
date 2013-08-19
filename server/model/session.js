// Copyright (c) Venzio 2013 All Rights Reserved

define(['db', 'crypto', 'password-hash'], function(db, crypto, passwordhash) {
  var schema = db.mongoose.Schema({
    created: Date,
    creds: [{
      email: String,
      password: String,
    }],
    ip: String,
    latest: Date,
    requests: Number,
    sessid: String,
    subdomain: String,
  });
  var sessionModel = db.mongoose.model('session', schema);
  return {
    model: sessionModel,

    getSession: function(sessid, callback, subdomain, ip) {
      // if the db is offline, return
      if (!db.connected) {
        setTimeout(callback.bind(null, null, null), 0);
        return;
      }

      // if there isn't a valid sessid, make a new session
      if (!sessid) {
        this.create(callback, subdomain, ip);
        return;
      }

      // otherwise fetch the existing one
      var hashedSSID = crypto.createHash('sha512').update(sessid, 'utf8').digest();
      sessionModel
        .findOne()
        .where('sessid').equals(hashedSSID)
        .exec(function(err, session) {
          if (err) {
            console.error(err);
          }
          if (!session) {
            // and if that fetch fails, create a new one
            this.create(callback, subdomain, ip);
            return;
          }

          session.requests++;
          session.latest = new Date();
          session.save(function(err) {
            if (err) {
              console.error(err);
            }
          });
          callback(session, null);
        }.bind(this));
    },

    create: function(callback, subdomain, ip) {
      function guid() {
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        };
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
      }

      var sessid = guid();
      var hashedSSID = crypto.createHash('sha512').update(sessid, 'utf8').digest();

      var session = new sessionModel();
      session.created = new Date();
      session.creds = [];
      session.ip = ip;
      session.latest = new Date();
      session.requests = 1;
      session.sessid = hashedSSID;
      session.subdomain = subdomain;

      session.save(function(err) {
        if (err) {
          console.error(err);
          callback(null, null);
        } else {
          callback(session, sessid);
        }
      });
    }
  };
});
