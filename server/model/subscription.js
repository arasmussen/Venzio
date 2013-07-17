// Copyright (c) Venzio 2013 All Rights Reserved

// developer subscription model
define(['db'], function(db) {
  var schema = db.mongoose.Schema({
    email: String,
    created: Date,
    active: Boolean
  });
  var subscriptionModel = db.mongoose.model('subscription', schema);
  return {
    model: subscriptionModel,

    subscribe: function(email, callback) {
      if (!this.checkEmail(email)) {
        callback('DEVELOPER_SUBSCRIBE_BAD_EMAIL');
      } else {
        // make sure it doesn't already exist
        subscriptionModel
          .findOne()
          .where('email').equals(email)
          .exec(function(err, subscription) {
            if (subscription) {
              if (subscription.active) {
                // subscription already active
                callback('DEVELOPER_SUBSCRIBE_EMAIL_ALREADY_EXISTS');
                return;
              }

              // reset the subscription to active
              subscription.active = true;
            } else {
              // create a new subscription
              subscription = new subscriptionModel();
              subscription.email = email;
              subscription.created = new Date();
              subscription.active = true;
            }

            // save subscription
            subscription.save(function(err) {
              if (err) {
                console.error(err);
                callback('DEVELOPER_SUBSCRIBE_FAIL');
              } else {
                callback('DEVELOPER_SUBSCRIBE_SUCCESS');
              }
            });
          });
      }
    },

    unsubscribe: function(email, callback) {
      if (!this.checkEmail(email)) {
        callback('DEVELOPER_UNSUBSCRIBE_BAD_EMAIL');
      } else {
        // make sure it actually exists
        subscriptionModel
          .findOne()
          .where('email').equals(email)
          .exec(function(err, subscription) {
            if (!subscription) {
              callback('DEVELOPER_UNSUBSCRIBE_EMAIL_DOESNT_EXIST');
            } else {
              if (!subscription.active) {
                callback('DEVELOPER_UNSUBSCRIBE_SUCCESS');
                return;
              }
              subscription.active = false;
              subscription.save(function(err) {
                if (err) {
                  console.error(err);
                  callback('DEVELOPER_UNSUBSCRIBE_FAIL');
                } else {
                  callback('DEVELOPER_UNSUBSCRIBE_SUCCESS');
                }
              });
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
    }
  };
});
