"use strict";

var toPosInt = require("es5-ext/number/to-pos-integer");

var create = Object.create;

module.exports = function (limit) {
	var size = 0,
		base = 1,
		queue = create(null),
		map = create(null),
		index = 0,
		del;
	limit = toPosInt(limit);
	return {
		hit: function (id) {
			var oldIndex = map[id];
			if (oldIndex === index) return undefined;
			var nuIndex = ++index;
			queue[nuIndex] = id;
			map[id] = nuIndex;
			if (!oldIndex) {
				++size;
				if (size <= limit) return undefined;
				id = queue[base];
				del(id);
				return id;
			}
			delete queue[oldIndex];
			if (base !== oldIndex) return undefined;
			while (!hasOwnProperty.call(queue, ++base)) continue; // jslint: ignore
			return undefined;
		},
		delete: (del = function (id) {
			var oldIndex = map[id];
			if (!oldIndex) return;
			delete queue[oldIndex];
			delete map[id];
			--size;
			if (base !== oldIndex) return;
			if (!size) {
				index = 0;
				base = 1;
				return;
			}
			while (!hasOwnProperty.call(queue, ++base)) continue; // jslint: ignore
		}),
		clear: function () {
			size = index = 0;
			base = 1;
			queue = create(null);
			map = create(null);
		}
	};
};
