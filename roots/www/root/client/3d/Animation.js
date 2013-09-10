// Copyright (c) Venzio 2013 All Rights Reserved

define(['basejs'],
  function(Base) {
    return Base.extend({
      constructor: function(anim_data) {
        this.bone_matrices = anim_data.bone_matrices;
      },

      getNumBones: function() {
        return this.bone_matrices.length;
      },

      getNumFrames: function() {
        return this.bone_matrices[0].length;
      },
    });
  }
);
