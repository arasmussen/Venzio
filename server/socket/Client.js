// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'server/SInputManager',
    'shared/Player'
  ], function(Base, InputManager, Player) {
    return Base.extend({
      constructor: function(socket, terrainManager, wallManager) {
        this.socket = socket;
        this.lastFrame = new Date().getTime();
        this.player = new Player(new InputManager(), terrainManager, wallManager);

        this.socket.on('input', this.handleInput.bind(this));
      },

      handleInput: function(data) {
        this.player.inputManager.handleInput(data.msg.input);
      },

      update: function() {
        this.player.handleInput();

        var time = new Date().getTime();
        var tslf = (time - this.lastFrame) / 1000;
        console.log(tslf);

        if (tslf < 0.002) {
          console.log('updating clients too quickly');
        } else if (tslf > 0.05) {
          console.log('updating clients too slowly');
        }

        this.lastFrame = time;
        tslf = (tslf < 0.001 ? 0.001 : tslf);
        tslf = (tslf > 0.200 ? 0.200 : tslf);

        this.player.update();

        return tslf;
      }
    });
  }
);
