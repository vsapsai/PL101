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
        case '+':
			check(expr.length >= 3, "Not enough arguments to '+'");
            return evalScheem(expr[1], env) + evalScheem(expr[2], env);
		case '-':
			check(expr.length >= 3, "Not enough arguments to '-'");
			return evalScheem(expr[1], env) - evalScheem(expr[2], env);
        case '*':
			check(expr.length >= 3, "Not enough arguments to '*'");
            return evalScheem(expr[1], env) * evalScheem(expr[2], env);
		case '/':
			check(expr.length === 3, "Incorrect arguments to '/'");
			return evalScheem(expr[1], env) / evalScheem(expr[2], env);

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

		case '=':
			check(expr.length === 3, "Incorrect arguments to '='. Expect 2");
            var eq = (evalScheem(expr[1], env) === evalScheem(expr[2], env));
            if (eq) return '#t';
            return '#f';
		case '<':
			check(expr.length === 3, "Incorrect arguments to '<'. Expect 2");
            var less = (evalScheem(expr[1], env) < evalScheem(expr[2], env));
            if (less) return '#t';
            return '#f';

		case 'cons':
			check(expr.length === 3, "Incorrect arguments to 'cons'. Expect 2");
            var head = evalScheem(expr[1], env);
            var rest = evalScheem(expr[2], env);
            return [head].concat(rest);
        case 'car':
			check(expr.length === 2, "Incorrect arguments to 'car'. Expect 1");
			var argument = evalScheem(expr[1], env);
			check((typeof argument != 'number') && (typeof argument != 'string'),
				"Can 'car' only a list");
			check(argument.length > 0, "Can 'car' only non-empty list");
			return argument[0];
        case 'cdr':
			check(expr.length === 2, "Incorrect arguments to 'cdr'. Expect 1");
            var result = evalScheem(expr[1], env);
			check((typeof result != 'number') && (typeof result != 'string'),
				"Can 'cdr' only a list");
            result.shift();
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
        	return function(args) {
        		var environment = {'bindings': {}, 'outer': env};
        		var variables = expr[1];
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

var isTerminalEnvironment = function(env) {
	return !env.hasOwnProperty('bindings');
};

var lookup = function (env, v) {
	check(!isTerminalEnvironment(env), v + " not found");
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
