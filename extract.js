/*
 * A library to parse arguments from functions based on their type
 *
 */

var extract = (function() {

	var typeList = [];

	function NoNameError(obj) {
		return {
			name: 'NoNameError',
			msg: 'Object type has no name attribute',
			value: obj
		};
	}

	function TypeNotFoundError(obj) {
		return {
			name: 'TypeNotFoundError',
			msg: 'Type "' + obj + '" not found',
			value: obj
		};
	}

	// Default to Array.forEach or make our own
	var forEach = Array.prototype.forEach || function(callback) {
		var i, l;
		for (i = 0, l = this.length; i < l; i++) {
			callback.call(this, this[i], i);
		}
	};

	// Extend target with extra properties
	function _extend(target) {
		forEach.call(Array.prototype.slice.call(arguments, 1), function(obj) {
			var prop;
			for (prop in obj) {
				if (obj.hasOwnProperty(prop)) {
					target[prop] = obj[prop];
				}
			}
		});

		return target;
	}

	// define a base Type type
	function Type(name, obj) {
		var title = (typeof name === 'string') ? name :
				(name && name.name) ? name.name : null,
			typeObj = (typeof name !== 'string') ? name :
				(obj || {});

		if (!title) {
			throw NoNameError(typeObj);
		}

		_extend(this, typeObj);
		this.name = title;
	}

	_extend(Type.prototype, {
		parse: function(obj) {
			return obj;
		},
		test: function() {
			return true;
		},
		list: false,
		defaultValue: null,
		extend: function(name, obj) {
			var newType = function() {};
			newType.prototype = _extend(new Type('default'), this);

			var extension = new Type(name, obj);
			return _extend(new newType(), extension);
		}
	});

	// define a default type (name is mandatory, so not included here)
	var defaultType = new Type('default');

	// add a new type to the type list
	function addType() {
		var args = extract(
			{ name: 'name', test: function(o) { return typeof o === 'string'; } },
			{ name: 'type', parse: function(o) {
				return (o instanceof Type) ? o : new Type(this.name, o);
			} }
		).from(arguments);

		typeList.push(args.type);
	}

	function getType(name) {
		var result = {};
		forEach.call(typeList, function(type) {
			if (type.name === name) {
				result = type;
			}
		});

		return result;
	}

	function listTypes() {
		return _extend([], typeList);
	}

	function clearTypes() {
		typeList = [];
	}

	/*
	 * from: turn a list of function arguments into a predictable object
	 */
	function from(args) {
		var result = {},
			types = this.types || [],
			set = function(type, value) {
				if (type.list) {
					result[type.name] = result[type.name] || [];
					result[type.name].push(value);
				} else {
					result[type.name] = result[type.name] || value;
				}
			};

		args = Array.prototype.slice.call(args); // args is likely arguments so not a proper array

		forEach.call(types, function(obj, pos) {
			var type = (typeof obj === 'string') ? getType(obj) : new Type(obj),
				index = 0,
				arg;

			if (type.name) {
				while (index < args.length) {
					arg = args[index];
					if (type.test.call(result, arg)) {
						set(type, type.parse.call(result, arg));
						args.splice(index, 1);
						if (!type.list) {
							break;
						}
					} else {
						index++;
					}
				}
				if (!result[type.name]) {
					set(type, type.defaultValue);
				}
			} else {
				throw (type.get) ? NoNameError(type) : TypeNotFoundError(obj);
			}
		});

		return result;
	}

	 /*
	  * Pass in some types that describe objects you would like returned.
	  * You then get a "from" function that you can pass an array into to extract
	  * those objects from.
	  *
	  * e.g.:
	  *
	  * var args = extract(
	  *     { name: 'tiddler', parse: function(t) { return store.get(t); }, default: null },
	  *     { name: 'callback', pos: 0, test: function(f) { return typeof f === 'function'; } },
	  *     { name: 'sub', test: function(s) { return s instanceof Sub; } },
	  *     { name: 'msg', pos: 1, test: function(s) { return typeof s === 'string'; } },
	  *     { name: 'renderFlag', pos: 2, parse: function(r) { return (r) ? true : false; } },
	  *     { name: 'rest', list: true, test: function(a) { return typeof a === 'number'; } }
	  * ).from(arguments);
	  *
	  */
	function extract() {
		var types = Array.prototype.slice.call(arguments);
		return {
			types: types,
			from: from
		};
	}

	return _extend(extract, {
		Type: Type,
		defaultType: defaultType,
		addType: addType,
		getType: getType,
		listTypes: listTypes,
		clearTypes: clearTypes
	});
}());
