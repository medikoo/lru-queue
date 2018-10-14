"use strict";

var toPosInt = require("es5-ext/number/to-pos-integer");

module.exports = function(limit) {
	var firstNode,
		lastNode,
		keymap = new Map(),
		size = 0;
	limit = toPosInt(limit);

	function removeNode(node, updateKeymap) {
		var previous = node.previous;
		var next = node.next;
		if (next) {
			next.previous = previous;
		}
		if (previous) {
			previous.next = next;
		}
		if (node === lastNode) {
			lastNode = previous;
			if (updateKeymap) {
				keymap.delete(node.key);
				size--;
			}
		}
		node.next = node.previous = undefined;
	}
	function appendToHead(node, updateKeymap) {
		node.next = firstNode;
		if (firstNode) {
			firstNode.previous = node;
		}
		firstNode = node;
		if (!lastNode) {
			lastNode = node;
		}
		if (updateKeymap) {
			keymap.set(node.key, node);
			size++;
		}
	}

	return {
		hit: function(key) {
			if (!keymap.has(key)) {
				appendToHead({ key: key }, true);
			} else {
				var node = keymap.get(key);
				if (node !== firstNode) {
					removeNode(node, false);
					appendToHead(node, false);
				}
			}
			if (size > limit) {
				var keyToremove = lastNode.key;
				removeNode(lastNode, true);
				return keyToremove;
			}
		},
		dump: function() {
			var list = new Array(size);
			for (var node = firstNode, index = 0; node; index++, node = node.next) {
				list[index] = node.key;
			}
			return [
				list,
				firstNode ? firstNode.key : undefined,
				lastNode ? lastNode.key : undefined
			];
		},
		delete: function(key) {
			var node = keymap.get(key);
			if (node) {
				removeNode(node, true);
			}
		},
		clear: function() {
			firstNode = lastNode = undefined;
			keymap.clear();
			size = 0;
		}
	};
};
