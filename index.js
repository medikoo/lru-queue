"use strict";

var toPosInt = require("es5-ext/number/to-pos-integer");

var LinkedList = function () {
	this.firstNode = this.lastNode = undefined;
	this.keymap = Object.create(null);
	this.size = 0;
};

LinkedList.prototype.removeNode = function (node, updateKeymap) {
	if (node.next) {
		node.next.previous = node.previous;
	}
	if (node.previous) {
		node.previous.next = node.next;
	}
	if (node === this.lastNode) {
		this.lastNode = node.previous;
		if (updateKeymap) {
			delete this.keymap[node.key];
			this.size--;
		}
	}
	node.next = node.previous = undefined;
};

LinkedList.prototype.appendToHead = function (node, updateKeymap) {
	if (this.firstNode) {
		node.next = this.firstNode;
		this.firstNode.previous = node;
	} else {
		this.lastNode = node;
	}
	this.firstNode = node;
	if (updateKeymap) {
		this.keymap[node.key] = node;
		this.size++;
	}
};

LinkedList.prototype.clear = function () {
	this.firstNode = this.lastNode = undefined;
	this.keymap = Object.create(null);
	this.size = 0;
};

LinkedList.prototype.getNode = function (key) {
	return this.keymap[key];
};

LinkedList.prototype.getSize = function () {
	return this.size;
};

module.exports = function (limit) {
	var list = new LinkedList();
	limit = toPosInt(limit);

	return {
		hit: function (key) {
			var node = list.getNode(key);
			if (!node) {
				list.appendToHead({ key: key }, true);
			} else if (node !== list.firstNode) {
				list.removeNode(node, false);
				list.appendToHead(node, false);
			}
			if (list.getSize() > limit) {
				var keyToremove = list.lastNode.key;
				list.removeNode(list.lastNode, true);
				return keyToremove;
			}
			return undefined;
		},
		delete: function (key) {
			var node = list.getNode(key);
			if (node) {
				list.removeNode(node, true);
			}
		},
		clear: function () {
			list.clear();
		}
	};
};
