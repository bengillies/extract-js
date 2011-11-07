module('extract/from', {});

test('Default Options return args in order', function() {
	var args = extract({name: 'foo'}, {name: 'bar'}).from(['arg1', 'arg2']);

	strictEqual(args.foo, 'arg1', 'arg1 is the first argument, so associates with foo');
	strictEqual(args.bar, 'arg2', 'arg2 is the second argument, so associates with bar');
});

test('left over args lost', function() {
	var args = extract({name: 'foo'}, {name: 'bar'}).from(['arg1', 'arg2', 'arg3']);

	expect(2);
	$.each(args, function(i, value) {
		strictEqual(value !== 'arg3', true, 'the left over argument should be lost');
	});
});

test('list holds an array', function() {
	var args = extract({name: 'foo'}, {name: 'rest', list: true})
		.from(['arg1', 'arg2', 'arg3']);

	strictEqual(args.foo, 'arg1', 'args before the list should still exist');
	strictEqual(args.rest.length, 2, 'rest should be a list');
	strictEqual(args.rest[0], 'arg2', 'the first item should be arg2');
	strictEqual(args.rest[1], 'arg3', 'the second item should be arg3');
});

test('"test" function sorts parameters', function() {
	var args = extract(
			{ name: 'foo', test: function(o) { return typeof o === 'string'; } },
			{ name: 'bar', test: function(o) { return typeof o === 'function'; } },
			{ name: 'baz', test: function(o) { return typeof o === 'number'; }, list: true }
		).from([10, function() { return 'bar'; }, 20, "foo"]);

	strictEqual(args.foo, 'foo', 'foo should return the string');
	strictEqual(args.bar(), 'bar', 'bar should return the function');
	strictEqual(args.baz.length, 2, 'bar should be a list of 2 numbers');
	strictEqual(args.baz[0], 10, 'baz[0] should be the first number');
	strictEqual(args.baz[1], 20, 'baz[1] should be the second number');
});

test('"test" function returns only the first item when list is not set', function() {
	var args = extract({ name: 'foo', test: function(o) { return typeof o === 'string'; } })
		.from([10, 'arg1', 20, 'arg2']);

	strictEqual(args.foo, 'arg1', 'foo returns the first string. All others are ignored');
});

test('"parse" function modifies arguments', function() {
	var args = extract({ name: 'foo', parse: function(o) { return o + 'bar'; } })
		.from(['foo']);

	strictEqual(args.foo, 'foobar', 'the original argument should be modified');
});

test('"parse" function allows object decomposition', function() {
	var args = extract({
			name: 'foo',
			parse: function(o) { this.bar = o.bar; this.baz = o.baz; return o; }
		}).from([{ bar: 'bar', baz: 'baz'}]);

	strictEqual(typeof args.foo === 'object', true, 'foo becomes the whole object');
	strictEqual(args.foo.bar, 'bar', 'foo contains bar');
	strictEqual(args.foo.baz, 'baz', 'foo contains baz');
	strictEqual(args.bar, 'bar', 'bar becomes the "bar" part of foo');
	strictEqual(args.baz, 'baz', 'baz becomes the "baz" part of foo');
});

test('strings as types', function() {
	extract.addType('foo', { test: function(o) { return o === 'foo'; },
		parse: function(o) { return o + 'bar'; } });

	var args = extract('foo').from([10, 'foo', 20]);

	strictEqual(args.foo, 'foobar', 'the string "foo" should return the "foo" type');
});
