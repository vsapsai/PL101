var check = function(condition, errorDetails) {
	if (!condition) {
		throw new Error(errorDetails);
	}
};

// An implementation of evalScheem
var evalScheem = function (expr, env) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
	// Strings are variable references
	if (typeof expr === 'string') {
		return lookup(env, expr);
	}
    // Look at head of list for operation
    switch (expr[0]) {
        case 'quote':
			check(expr.length === 2, "Too many arguments to quote. Expect 1");
            return expr[1];

		case 'define':
			check(expr.length === 3, "Incorrect arguments to 'define'. Expect 2");
			check(typeof expr[1] === 'string', "Trying to define not a variable");
			check(isTerminalEnvironment(env) || isTerminalEnvironment(env.outer), "Should 'define' variables only in global scope");
			addBinding(env, expr[1], evalScheem(expr[2], env));
			return 0;
		case 'set!':
			check(expr.length === 3, "Incorrect arguments to 'set!'. Expect 2");
			// no need to check if expr[1] is variable because we shouldn't have it in env in the first place
			update(env, expr[1], evalScheem(expr[2], env));
			return 0;

		case 'begin':
			check(expr.length > 1, "Not enough arguments to 'begin'");
            var result = 0;
            var i = 1;
            for (i = 1; i < expr.length; i++) {
                result = evalScheem(expr[i], env);
            }
            return result;

		case 'if':
			check(expr.length === 4, "Incorrect arguments to 'if'. Expect 3");
            var condition = evalScheem(expr[1], env);
            var result = 0;
            if (condition === '#t') {
                result = evalScheem(expr[2], env);
            } else if (condition === '#f') {
                result = evalScheem(expr[3], env);
			} else {
				check(false, "Encountered not a boolean in boolean 'if' context");
			}
            return result;

        case 'lambda':
        	check(expr.length === 3, "Incorrect arguments to 'lambda'. Expect 2");
        	var variables = expr[1];
        	check((typeof variables != 'number') && (typeof variables != 'string'), "First 'lambda' argument must be a variables list");
        	variables.forEach(function(element, index, array) {
        		check(typeof element === 'string', "'lambda' arguments list must contain only variables");
        	});
        	return function(args) {
        		var environment = {'bindings': {}, 'outer': env};
        		check(arguments.length === variables.length, "Arguments count mismatch");
        		for (var i = 0; i < variables.length; i++) {
        			addBinding(environment, variables[i], arguments[i]);
        		}
        		return evalScheem(expr[2], environment);
        	};
        default:
        	var func = evalScheem(expr[0], env);
            var evaluatedArguments = expr.slice(1).map(function (arg) { return evalScheem(arg, env); });
			return func.apply(null, evaluatedArguments);
    }
};

// Built-in functions.
var add = function (x, y) {
	check(arguments.length >= 2, "Not enough arguments to '+'");
	return x + y;
};
var subtract = function (x, y) {
	check(arguments.length >= 2, "Not enough arguments to '-'");
	return x - y;
};
var multiply = function (x, y) {
	check(arguments.length >= 2, "Not enough arguments to '*'");
	return x * y;
};
var divide = function (x, y) {
	check(arguments.length === 2, "Incorrect arguments to '/'");
	return x / y;
};

var booleanRepresentation = function (x) {
	check(typeof x === 'boolean', "Trying to use not boolean in boolean context")
	if (x) return '#t';
	return '#f';
};
var equalPredicate = function (x, y) {
	check(arguments.length === 2, "Incorrect arguments to '='. Expect 2");
	return booleanRepresentation(x === y);
};
var lessPredicate = function (x, y) {
	check(arguments.length === 2, "Incorrect arguments to '<'. Expect 2");
	return booleanRepresentation(x < y);
};		

var cons = function (head, rest) {
	check(arguments.length === 2, "Incorrect arguments to 'cons'. Expect 2");
	return [head].concat(rest);
};
var car = function (list) {
	check(arguments.length === 1, "Incorrect arguments to 'car'. Expect 1");
	check((typeof list != 'number') && (typeof list != 'string'), "Can 'car' only a list");
	check(list.length > 0, "Can 'car' only non-empty list");
	return list[0];
};
var cdr = function (list) {
	check(arguments.length === 1, "Incorrect arguments to 'car'. Expect 1");
	check((typeof list != 'number') && (typeof list != 'string'), "Can 'cdr' only a list");
	return list.slice(1);
};

var scheemAlert = function (message) {
	if (typeof module !== 'undefined') {
		console.log(message);
	} else {
		window.alert(message);
	}
};

var builtinFunctions = {
	'+': add,
	'-': subtract,
	'*': multiply,
	'/': divide,

	'=': equalPredicate,
	'<': lessPredicate,

	'cons': cons,
	'car': car,
	'cdr': cdr,

	'alert': scheemAlert
}

// Environment-related functions.
var isTerminalEnvironment = function (env) {
	return !env.hasOwnProperty('bindings');
};

var builtinLookup = function (v) {
	check(builtinFunctions.hasOwnProperty(v), v + " not found");
	return builtinFunctions[v];
};
var lookup = function (env, v) {
	if (isTerminalEnvironment(env)) {
		return builtinLookup(v);
	}
    if (env.bindings.hasOwnProperty(v)) {
        return env.bindings[v];
    }
    return lookup(env.outer, v);
};

var update = function (env, v, val) {
	check(!isTerminalEnvironment(env), v + " not found. Cannot set variable");
    if (env.bindings.hasOwnProperty(v)) {
        env.bindings[v] = val;
    } else {
		update(env.outer, v, val);
    }
};

var addBinding = function (env, v, val) {
	if (isTerminalEnvironment(env)) {
		env.bindings = {};
		env.outer = {};
	}
	check(!(v in env.bindings), "Cannot redefine variable " + v);
    env.bindings[v] = val;
};

// If we are used as Node module, export evalScheem
if (typeof module !== 'undefined') {
	module.exports.evalScheem = evalScheem;
}
