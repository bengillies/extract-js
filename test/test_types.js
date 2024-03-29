module('Type', {
	teardown: function() {
		extract.clearTypes();
	}
});

test('New Type', function() {
	var t = new extract.Type({
		name: 'foo',
		parse: function(o) {
			return o + 'bar';
		}
	});

	strictEqual(t instanceof extract.Type, true, 't is a Type');
	strictEqual(t.parse('foo'), 'foobar', 'it gains a new parse method');
	strictEqual(t.name, 'foo', 'it is called foo');
	strictEqual(t.test('qwerty'), true, 'it uses the default test function');
});

test('extend Type', function() {
	var t = new extract.Type({
		name: 'foo',
		parse: function(o) {
			return o + 'bar';
		}
	});

	var newT = t.extend('bar', { test: function(o) { return o === 'bar'; } });

	strictEqual(newT instanceof extract.Type, true, 'newT is also a Type');
	strictEqual(t.test('qwerty'), true, 't still uses the default test');
	strictEqual(newT.test('qwerty'), false, 'newT does not pass the default test');
	strictEqual(newT.test('bar'), true, 'newT uses its own test method');
});

test('store types', function() {
	var t = new extract.Type({
		name: 'foo',
		parse: function(o) {
			return o + 'bar';
		}
	});

	var newT = t.extend('bar', { test: function(o) { return o === 'bar'; } });

	extract.addType(t);
	extract.addType(newT);

	var types = extract.listTypes();

	strictEqual(types.length, 2, 'there are two types');
	strictEqual(types[0].name, 'foo', 'the first type is foo');
	strictEqual(types[1].name, 'bar', 'the second type is bar');

	var getType = extract.getType('foo');
	strictEqual(getType.name, 'foo', 'We can retrieve the foo type by name');
	strictEqual(getType.parse('foo'), 'foobar', 'it is actually the foo type');
});
