// Copyright (c) Venzio 2013 All Rights Reserved

// This is a wrapper class for web workers that makes it so that using web
// workers that use requirejs is easier. It makes the assumption that inside
// the worker's requirejs function is a postMessage('require') statement.
//
// It basically works by queueing all message sends until it gets
// acknowledgement from the worker that require has initialized. After it gets
// this acknowledgement, it emptys the queue by sending all the messages.
define(['basejs'],
  function(Base) {
    return Base.extend({
      constructor: function(worker, path) {
        this.ready = false;
        this.sendQueue = [];
        this.worker = new worker(path);
        this.worker.onmessage = this.handleMessage.bind(this);
      },

      postMessage: function(data) {
        if (!this.ready) {
          this.sendQueue.push(data);
        } else {
          this.worker.postMessage(data);
        }
      },

      handleMessage: function(e) {
        if (e.data.type == 'require') {
          this.ready = true;
          this.processSendQueue();
        } else if (typeof this.onmessage === 'function') {
          this.onmessage(e);
        } else {
          console.log('RequireWorker: no onmessage function associated');
        }
      },

      processSendQueue: function() {
        for (var i = 0; i < this.sendQueue.length; i++) {
          this.worker.postMessage(this.sendQueue[i]);
        }
        this.sendQueue = [];
      }
    });
  }
);
