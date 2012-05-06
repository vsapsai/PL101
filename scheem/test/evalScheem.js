var assert = require('chai').assert;
var evalScheem = require('../scheem').evalScheem;

suite('arithmetic', function() {
	test('number', function() {
		assert.deepEqual(
			evalScheem(3, {}),
			3
		);
	});
    test('add two numbers', function() {
        assert.deepEqual(
            evalScheem(['+', 3, 5], {}),
            8
        );
    });
    test('add two other numbers', function() {
        assert.deepEqual(
            evalScheem(['+', 2, 2], {}),
            4
        );
    });
    test('add a number and an expression', function() {
        assert.deepEqual(
            evalScheem(['+', 3, ['+', 2, 2]], {}),
            7
        );
    });
	test('subtraction', function() {
		assert.deepEqual(
			evalScheem(['-', 7, 5], {}),
			2
		);
	});
	test('multiplication', function() {
		assert.deepEqual(
			evalScheem(['*', 2, 3], {}),
			6
		);
	});
	test('division', function() {
		assert.deepEqual(
			evalScheem(['/', 2, 4], {}),
			0.5
		);
	});
	test('complex expression', function() {
		assert.deepEqual(
			evalScheem(['*', ['/', 8, 4], ['+', 1, 1]], {}),
			4
		);
	});
	test('incorrect arguments error', function() {
		assert.throws(function() {
			evalScheem(['+', 2], {});
		});
		assert.throws(function() {
			evalScheem(['-', 2], {});
		});
		assert.throws(function() {
			evalScheem(['*'], {});
		});
		assert.throws(function() {
			evalScheem(['/', 2, 3, 4], {});
		});
	});
});
suite('variables', function() {
	var env = {x:2, y:3, z:10};
	test('single variable', function() {
		assert.deepEqual(
			evalScheem('x', env),
			2
		);
	});
	test('unknown variable error', function() {
		assert.throws(function() {
			evalScheem('x', {});
		});
	});
	test('arithmetic with variable', function() {
		assert.deepEqual(
			evalScheem(['*', 'y', 3], env),
			9
		);
	});
	test('complex expression with variables', function() {
		assert.deepEqual(
			evalScheem(['/', 'z', ['+', 'x', 'y']], env),
			2
		);
	});
	test('define variable', function() {
		var mutableEnv = {};
		evalScheem(['define', 'a', 5], mutableEnv);
		assert.deepEqual(mutableEnv, {a:5});
	});
	test('incorrect arguments to define error', function() {
		assert.throws(function() {
			evalScheem(['define', 'a'], {});
		});
		assert.throws(function() {
			evalScheem(['define', 'a', 5, 7], {});
		});
	});
	test('define not a variable error', function() {
		assert.throws(function() {
			evalScheem(['define', 2, 3], {});
		});
	});
	test('redefine variable error', function() {
		assert.throws(function() {
			evalScheem(['define', 'a', 5], {a:3});
		});
	});
	test('set variable', function() {
		var mutableEnv = {a:5};
		evalScheem(['set!', 'a', 1], mutableEnv);
		assert.deepEqual(mutableEnv, {a:1});
	});
	test('incorrect arguments to set! error', function() {
		assert.throws(function() {
			evalScheem(['set!', 'a'], {a:2});
		});
		assert.throws(function() {
			evalScheem(['set!', 'a', 3, 7], {a:2});
		});
	});
	test('set unknown variable error', function() {
		assert.throws(function() {
			evalScheem(['set!', 'a', 1], {});
		});
	});
	test('set variable to arithmetic expression', function() {
		var mutableEnv = {x:7, y:3, a:2};
		evalScheem(['set!', 'y', ['+', 'x', 1]], mutableEnv);
		assert.deepEqual(mutableEnv, {x:7, y:8, a:2});
	});
});
suite('quote', function() {
    test('a number', function() {
        assert.deepEqual(
            evalScheem(['quote', 3], {}),
            3
        );
    });
    test('an atom', function() {
        assert.deepEqual(
            evalScheem(['quote', 'dog'], {}),
            'dog'
        );
    });
    test('a list', function() {
        assert.deepEqual(
            evalScheem(['quote', [1, 2, 3]], {}),
            [1, 2, 3]
        );
    });
	test('too many arguments error', function() {
		assert.throws(function() {
			evalScheem(['quote', [1, 2], [3, 4]], {});
		});
	});
});
suite('begin', function() {
	test('simple numbers', function() {
		assert.deepEqual(
			evalScheem(['begin', 1, 2, 3], {}),
			3
		);
	});
	test('with arithmetic', function() {
		assert.deepEqual(
			evalScheem(['begin', ['+', 2, 2]], {}),
			4
		);
	});
	test('with variables', function() {
		assert.deepEqual(
			evalScheem(['begin', 'x', 'y', 'x'], {x:1, y:2}),
			1
		);
	});
	test('with setting variable(s)', function() {
		assert.deepEqual(
			evalScheem(['begin',
						['set!', 'x', 5],
						['set!', 'x', ['+', 'y', 'x']],
						'x'], {x:1, y:2}),
			7
		);
	});
	test('not enough arguments error', function() {
		assert.throws(function() {
			evalScheem(['begin'], {});
		});
	});
});
suite('comparison operators', function() {
	test('equal', function() {
		assert.deepEqual(
			evalScheem(['=', 2, 2], {}),
			'#t'
		);
		assert.deepEqual(
			evalScheem(['=', 2, 3], {}),
			'#f'
		);
		assert.deepEqual(
			evalScheem(['=', ['+', 5, 1], ['*', 2, 3]], {}),
			'#t'
		);
	});
	test('less', function() {
		assert.deepEqual(
			evalScheem(['<', 2, 2], {}),
			'#f'
		);
		assert.deepEqual(
			evalScheem(['<', 2, 3], {}),
			'#t'
		);
		assert.deepEqual(
			evalScheem(['<', ['+', 1, 1], ['+', 2, 3]], {}),
			'#t'
		);
	});
	test('incorrect arguments error', function() {
		assert.throws(function() {
			evalScheem(['=', 1], {});
		});
		assert.throws(function() {
			evalScheem(['=', 1, 1, 2], {});
		});
		assert.throws(function() {
			evalScheem(['<', 1], {});
		});
		assert.throws(function() {
			evalScheem(['<', 1, 1, 2], {});
		});
	});
});
suite('list operators', function() {
	test('cons', function() {
		assert.deepEqual(
			evalScheem(['cons', 1, ['quote', [2, 3]]], {}),
			[1, 2, 3]
		);
	});
	test('cons 2 numbers', function() {
		assert.deepEqual(
			evalScheem(['cons', 1, 2], {}),
			[1, 2]
		);
	});
	test('cons list', function() {
		assert.deepEqual(
			evalScheem(['cons', ['quote', [1, 2]], ['quote', [3, 4]]], {}),
			[[1, 2], 3, 4]
		);
	});
	test('car', function() {
		assert.deepEqual(
			evalScheem(['car', ['quote', [[1, 2], 3, 4]]], {}),
			[1, 2]
		);
		assert.deepEqual(
			evalScheem(['car', 'x'], {x:[4, 2]}),
			4
		);
	});
	test('cdr', function() {
		assert.deepEqual(
			evalScheem(['cdr', ['quote', [[1, 2], 3, 4]]], {}),
			[3, 4]
		);
	});
	test('incorrect arguments count error', function() {
		assert.throws(function() {
			evalScheem(['cons', 1, 2, 3], {});
		});
		assert.throws(function() {
			evalScheem(['car', ['quote', [1, 2]], ['quote', [3]]], {});
		});
		assert.throws(function() {
			evalScheem(['cdr', ['quote', [1, 2]], ['quote', [3]]], {});
		});
	});
	test('car/cdr not a list error', function() {
		assert.throws(function() {
			evalScheem(['car', 2], {});
		});
		assert.throws(function() {
			evalScheem(['cdr', 'x'], {x:7});
		});
	});
	test('car empty list error', function() {
		assert.throws(function() {
			evalScheem(['car', ['quote', []]], {});
		});
		// though cdr '() is OK
		assert.deepEqual(
			evalScheem(['cdr', ['quote', []]], {}),
			[]
		);
	});
});
suite('conditionals', function() {
	test('simple if', function() {
		assert.deepEqual(
			evalScheem(['if', ['=', 1, 1], 2, 3], {}),
			2
		);
		assert.deepEqual(
			evalScheem(['if', ['=', 1, 0], 2, 3], {}),
			3
		);
	});
	test('only one if branch is evaluated', function() {
		assert.deepEqual(
			evalScheem(['if', ['=', 1, 1], 2, 'error'], {}),
			2
		);
		assert.deepEqual(
			evalScheem(['if', ['=', 1, 0], 'error', 3], {}),
			3
		);
	});
	test('nested', function() {
		assert.deepEqual(
			evalScheem(['if', ['=', 1, 1], ['if', ['=', 2, 3], 10, 11], 12], {}),
			11
		);
	});
	test('incorrect arguments error', function() {
		assert.throws(function() {
			evalScheem(['if', ['=', 1, 1]], {});
		});
		assert.throws(function() {
			evalScheem(['if', ['=', 1, 1], 2, 3, 4], {});
		});
	});
	test('not a boolean error', function() {
		assert.throws(function() {
			evalScheem(['if', 1, 2, 3], {});
		});
	});
});
