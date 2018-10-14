var performance = require("perf_hooks").performance;
var oldImplementation = require("./oldImplementation");
var linkedListImplementation = require("./linkedListImplementation");
var currentImplementation = require("..");

function randomInsert(LruQueue) {
	var N = 250000;
	var queue = LruQueue(5);
	for (var counter = 0; counter < 33; counter++) {
		for (var i = 0; i < 10 * N; ++i) {
			var index = Math.floor(Math.random() * 5 * N);
			queue.hit(index);
		}
	}
}

function incrementInsert(LruQueue) {
	var N = 250000;
	var queue = LruQueue(5);
	for (var counter = 0; counter < 33; counter++) {
		for (var i = 0; i < 10 * N; ++i) {
			queue.hit(Math.floor(i / 10));
		}
	}
}

function frequentHit(LruQueue) {
	var queue = LruQueue(5);
	queue.hit("a");
	for (let counter = 0; counter < 1e3; counter++) {
		for (let counter2 = 0; counter2 < 1e5; counter2++) {
			queue.hit("b");
		}
		queue.hit("a");
	}
}

function cyclical(LruQueue) {
	var queue = LruQueue(3);
	for (let counter = 0; counter < 1e7; counter++) {
		queue.hit("a");
		queue.hit("b");
		queue.hit("c");
		queue.hit("d");
	}
}

function fibo(queueSize) {
	var helper = function(LruQueue) {
		var getMemoize = function(LruQueue) {
			return function(fn) {
				var cache = new Map(),
					queue = LruQueue(queueSize);
				return function(x) {
					var result = cache.get(x),
						cleared;
					if (result !== undefined) {
						queue.hit(x);
						return result;
					}
					result = fn(x);
					cache.set(x, result);
					cleared = queue.hit(x);
					if (cleared !== undefined) cache.delete(cleared);
					return result;
				};
			};
		};

		var getMemoizedFibonacci = function(memoize) {
			var fib = memoize(function(x) {
				return x < 2 ? 1 : fib(x - 1) + fib(x - 2);
			});
			return fib;
		};

		var repeatCount = 1000,
			base = 4000,
			memo,
			i;

		total = 0;
		i = repeatCount;
		while (i--) {
			memo = getMemoizedFibonacci(getMemoize(LruQueue));
			memo(base);
		}
	};
	Object.defineProperty(helper, "name", { value: "fibo_" + queueSize });
	return helper;
}

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

testCases.forEach(function(test) {
	console.log("----" + test.name + "----");
	Object.keys(implementations).forEach(function(name) {
		var start = performance.now();
		test(implementations[name]);
		var total = performance.now() - start;
		console.log(name + " -> " + total + "ms");
	});
});
