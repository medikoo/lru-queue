"use strict";
/* global Map, console */

var performance = require("perf_hooks").performance;
var oldImplementation = require("./oldImplementation");
var linkedListImplementation = require("./linkedListImplementation");
var currentImplementation = require("..");

var randomInsert = function (lruQueue) {
	var maximumValue = 1250000;
	var queue = lruQueue(5);
	for (var counter = 0; counter < 33; counter++) {
		for (var i = 0; i < 2 * maximumValue; ++i) {
			var index = Math.floor(Math.random() * maximumValue);
			queue.hit(index);
		}
	}
};

var incrementInsert = function (lruQueue) {
	var maximumValue = 250000;
	var queue = lruQueue(5);
	for (var counter = 0; counter < 33; counter++) {
		for (var i = 0; i < 10 * maximumValue; ++i) {
			queue.hit(Math.floor(i / 10));
		}
	}
};

var frequentHit = function (lruQueue) {
	var queue = lruQueue(5);
	queue.hit("a");
	for (var counter = 0; counter < 1e3; counter++) {
		for (var counter2 = 0; counter2 < 1e5; counter2++) {
			queue.hit("b");
		}
		queue.hit("a");
	}
};

var cyclical = function (lruQueue) {
	var queue = lruQueue(3);
	for (var counter = 0; counter < 1e7; counter++) {
		queue.hit("a");
		queue.hit("b");
		queue.hit("c");
		queue.hit("d");
	}
};

var fibo = function (queueSize) {
	var helper = function (lruQueue) {
		var memoize = function (fn) {
			var cache = new Map(),
				queue = lruQueue(queueSize);
			return function (input) {
				var result = cache.get(input),
					cleared;
				if (result !== undefined) {
					queue.hit(input);
					return result;
				}
				result = fn(input);
				cache.set(input, result);
				cleared = queue.hit(input);
				if (cleared !== undefined) cache.delete(cleared);
				return result;
			};
		};

		var getMemoizedFibonacci = function () {
			var fib = memoize(function (index) {
				return index < 2 ? 1 : fib(index - 1) + fib(index - 2);
			});
			return fib;
		};

		var repeatCount = 1000,
			base = 4000,
			memo,
			i = repeatCount;
		while (i--) {
			memo = getMemoizedFibonacci();
			memo(base);
		}
	};
	Object.defineProperty(helper, "name", { value: "fibo_" + queueSize });
	return helper;
};

var testCases = [
	randomInsert,
	incrementInsert,
	frequentHit,
	cyclical,
	fibo(5),
	fibo(1000)
];

var implementations = {
	"Old implementation": oldImplementation,
	"Current implementation": currentImplementation,
	"Linked list implementation": linkedListImplementation
};

testCases.forEach(function (test) {
	// eslint-disable-next-line no-console
	console.log("----" + test.name + "----");
	Object.keys(implementations).forEach(function (name) {
		var start = performance.now();
		test(implementations[name]);
		var total = performance.now() - start;
		// eslint-disable-next-line no-console
		console.log(name + " -> " + total + "ms");
	});
});
