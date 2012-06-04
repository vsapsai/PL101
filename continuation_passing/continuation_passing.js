// Recursive style
var generate_list = function(length) {
	if (length <= 0) {
		return [];
	} else {
		var result = generate_list(length - 1);
		result.push(length);
		return result;
	}
};

// Continuation-passing style
var generate_list_CPS = function(length, cont) {
	if (length <= 0) {
		return cont([]);
	} else {
		var new_cont = function(list) {
			list.push(length);
			return cont(list);
		};
		return generate_list_CPS(length - 1, new_cont);
	}
};

// Thunk style
var thunk = function(f, lst) {
	return { tag: "thunk", func: f, args: lst };
};
var thunk_value = function(x) {
	return { tag: "value", val: x };
};
var generate_list_thunk = function(length, cont) {
	if (length <= 0) {
		return thunk(cont, [ [] ]);
	} else {
		var new_cont = function(list) {
			list.push(length);
			return thunk(cont, [list]);
		};
		return thunk(generate_list_thunk, [length - 1, new_cont]);
	}
};

var trampoline = function(thk) {
	while (true) {
		if (thk.tag === "value") {
			return thk.val;
		}
		if (thk.tag === "thunk") {
			thk = thk.func.apply(null, thk.args);
		}
	}
};
var big_generate_list = function(length) {
	return trampoline(generate_list_thunk(length, thunk_value));
};

// testing function
console.log(generate_list(3));
//var l = generate_list(20000);

generate_list_CPS(5, console.log);
console.log(generate_list_thunk(3, thunk_value));

console.log(big_generate_list(20000).slice(19990));
