// Copyright (c) Venzio 2013 All Rights Reserved

define(['basejs'], function(Base) {
  return Base.extend({
    constructor: function(seed, max) {
      this.seed = seed;
      this.max = max;
    },

    // -returns n, a random number where 0 <= n < max
    // -the number will be the same for the same seed/string
    // -the number will (probably) be different for different seed or string
    hash: function(string) {
      return this.Murmur2Hash(string) % this.max;
    },

    Murmur2Hash: function(string) {
      var m = 0x5bd1e995;
      var r = 24;
      var h = this.seed ^ string.length;
      var length = string.length;
      var currentIndex = 0;

      while (length >= 4) {
        var k = this.UInt32(string, currentIndex);

        k = this.Umul32(k, m);
        k ^= k >>> r;
        k = this.Umul32(k, m);

        h = this.Umul32(h, m);
        h ^= k;

        currentIndex += 4;
        length -= 4;
      }

      switch (length) {
      case 3:
        h ^= this.UInt16(string, currentIndex);
        h ^= string.charCodeAt(currentIndex + 2) << 16;
        h = this.Umul32(h, m);
        break;

      case 2:
        h ^= this.UInt16(string, currentIndex);
        h = this.Umul32(h, m);
        break;

      case 1:
        h ^= string.charCodeAt(currentIndex);
        h = this.Umul32(h, m);
        break;
      }

      h ^= h >>> 13;
      h = this.Umul32(h, m);
      h ^= h >>> 15;

      return h >>> 0;
    },

    UInt32: function(string, pos) {
      return (string.charCodeAt(pos++)) +
            (string.charCodeAt(pos++) << 8) +
            (string.charCodeAt(pos++) << 16) +
            (string.charCodeAt(pos) << 24);
    },

    UInt16: function(string, pos) {
      return (string.charCodeAt(pos++)) +
            (string.charCodeAt(pos++) << 8);
    },

    Umul32: function(n, m) {
      n = n | 0;
      m = m | 0;
      var nlo = n & 0xffff;
      var nhi = n >>> 16;
      var res = ((nlo * m) + (((nhi * m) & 0xffff) << 16)) | 0;
      return res;
    }
  });
});
