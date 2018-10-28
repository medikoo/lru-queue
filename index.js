"use strict";

var toPosInt = require("es5-ext/number/to-pos-integer");

module.exports = function(limit) {
	var queue = new Set(),
		lastKey = undefined,
		limit = toPosInt(limit);
	return {
		hit: function(id) {
			if (lastKey === id) return;
			lastKey = id;
			if (queue.delete(id)) {
				queue.add(id);
				return;
			}
			queue.add(id);
			if (queue.size > limit) {
				var base = queue.keys().next().value;
				queue.delete(base);
				return base;
			}
		},
		delete: function(id) {
			if (lastKey === id) {
				lastKey = undefined;
			}
			queue.delete(id);
		},
		clear: function() {
			queue.clear();
		}
	};
};
