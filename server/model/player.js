// Copyright (c) Venzio 2013 All Rights Reserved

define(['db/db', 'password-hash'], function(db, passwordhash) {
  var schema = db.mongoose.Schema({
    email: String,
    password: String,
    name: String,
    username: String,
    cardToken: String,
    authorizedGames: [String],
    created: Date
  });
  var playerModel = db.mongoose.model('player', schema);
  return {
    model: playerModel,

    create: function(email, password, name, username, callback) {
      if (!this.checkEmail(email)) {
        callback('CREATE_PLAYER_EMAIL_BAD_FORMAT');
      } else if (!this.checkPassword(password)) {
        callback('CREATE_PLAYER_PASSWORD_BAD_FORMAT');
      } else if (!this.checkName(name)) {
        callback('CREATE_PLAYER_NAME_BAD_FORMAT');
      } else if (!this.checkUsername(username)) {
        callback('CREATE_PLAYER_USERNAME_BAD_FORMAT');
      } else {
        var player = new playerModel();
        player.email = email;
        player.password = passwordhash.generate(password);
        player.name = name;
        player.username = username;
        player.cardToken = null;
        player.authorizedGames = [];
        player.created = new Date();

        player.save(function(err) {
          if (err) {
            console.error(err);
            callback('CREATE_PLAYER_FAILED');
          } else {
            callback('CREATE_PLAYER_SUCCESS');
          }
        });
      }
    },

    login: function(emailOrUsername, password, callback) {
      var isEmail = this.checkEmail(emailOrUsername);
      if (!isEmail && !this.checkUsername(emailOrUsername)) {
        callback('PLAYER_LOGIN_EMAILUSERNAME_BAD_FORMAT');
      } else if (!this.checkPassword(password)) {
        callback('PLAYER_LOGIN_PASSWORD_BAD_FORMAT');
      } else {
        playerModel
          .findOne()
          .where((isEmail ? 'email' : 'username')).equals(emailOrUsername)
          .exec(function(err, player) {
            if (!player) {
              callback('PLAYER_LOGIN_EMAIL_DOESNT_EXIST');
            } else if (passwordhash.verify(password, player.password)) {
              callback('PLAYER_LOGIN_SUCCESS');
            } else {
              callback('PLAYER_LOGIN_WRONG_PASSWORD');
            }
          });
      }
    },

    checkEmail: function(email) {
      if (!email) {
        return false;
      }
      var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!emailRegex.test(email) || email.length < 4 || email.length > 64) {
        return false;
      }
      return true;
    },

    checkPassword: function(password) {
      if (!password) {
        return false;
      }
      if (password.length < 4 || password.length > 64) {
        return false;
      }
      return true;
    },

    checkName: function(name) {
      if (!name) {
        return false;
      }
      if (name.length < 4 || name.length > 64) {
        return false;
      }
      return true;
    },

    checkUsername: function(username) {
      if (!username) {
        return false;
      }
      if (username.length < 2 || username.length > 32) {
        return false;
      }
      return true;
    }
  };
});
