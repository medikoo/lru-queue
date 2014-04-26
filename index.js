'use strict';

var toPosInt = require('es5-ext/number/to-pos-integer')
  , d        = require('d')
  , ee       = require('event-emitter')

  , create = Object.create, defineProperties = Object.defineProperties
  , hasOwnProperty = Object.prototype.hasOwnProperty
  , LruQueue;

LruQueue = module.exports = function (limit) {
	if (!(this instanceof LruQueue)) return new LruQueue(limit);
	defineProperties(this, {
		__limit__: d('', toPosInt(limit)),
		__size__: d('w', 0),
		__base__: d('w', 1),
		__queue__: d('w', create(null)),
		__map__: d('w', create(null)),
		__index__: d('w', 0)
	});
};

ee(Object.defineProperties(LruQueue.prototype, {
	hit: d(function (id) {
		var oldIndex = this.__map__[id], nuIndex = ++this.__index__;
		this.__queue__[nuIndex] = id;
		this.__map__[id] = nuIndex;
		if (!oldIndex) {
			++this.__size__;
			if (this.__size__ > this.__limit__) {
				id = this.__queue__[this.__base__];
				this.delete(id);
				this.emit('overflow', id);
			}
			return;
		}
		delete this.__queue__[oldIndex];
		if (this.__base__ !== oldIndex) return;
		while (!hasOwnProperty.call(this.__queue__, ++this.__base__)) continue; //jslint: skip
	}),
	delete: d(function (id) {
		var oldIndex = this.__map__[id];
		if (!oldIndex) return;
		delete this.__queue__[oldIndex];
		delete this.__map__[id];
		--this.__size__;
		if (this.__base__ !== oldIndex) return;
		if (!this.__size__) {
			this.__index__ = 0;
			this.__base__ = 1;
			return;
		}
		while (!hasOwnProperty.call(this.__queue__, ++this.__base__)) continue; //jslint: skip
	}),
	clear: d(function () {
		this.__size__ = 0;
		this.__base__ = 1;
		this.__queue__ = create(null);
		this.__map__ = create(null);
		this.__index__ = 0;
	})
}));
