var LanguageGenerator = (function() {

var LanguageGenerator = {
	VERSION: "0.1.0",
};

function check(condition, errorDetails) {
	if (!condition) {
		throw new Error(errorDetails);
	}
};

var TERMINAL_SYMBOL = "terminal";
var NONTERMINAL_SYMBOL = "nonterminal";

// Intermediate sentence form is a tree.
// Tree node structure: {type: "terminal", value: "abc", children: []}.
function makeNode(type, value) {
	return {type: type, value: value, children: []};
};

function postOrderEnumerate(root, callback) {
	var i = 0;
	var childrenCount = root.children.length;
	for (i = 0; i < childrenCount; i++) {
		postOrderEnumerate(root.children[i], callback);
	}
	callback.apply(null, [root]);
};

function collectLeavesOfType(root, type) {
	var result = [];
	postOrderEnumerate(root, function(node) {
		if ((node.type === type) && (0 === node.children.length)) {
			result.push(node);
		}
	});
	return result;
}

var DefaultRandomnessProvider = {
	randomInt: function(min, max) {
		if (arguments.length == 1) {
			max = min;
			min = 0;
		}
		check(max > min, "max should be greater than min");
		if (max - min === 1) {
			return min;
		}
		var result = Math.floor(Math.random() * (max - min + 1)) + min;
		if (result === max) {
			result = result - 1;
		}
		return result;
	}
};

function rewriteRule(expression, randomnessProvider) {
	var rewriteFunctions = {
		"rule_ref": rewrite_rule_ref,
		"literal": rewrite_literal,
		"choice": rewrite_choice,
	};
	function rewrite_rule_ref(expression) {
		check(typeof expression.name === "string", "Invalid rule_ref expression");
		return [makeNode(NONTERMINAL_SYMBOL, expression.name)];
	};
	function rewrite_literal(expression) {
		return [makeNode(TERMINAL_SYMBOL, expression.value)];
	};
	function rewrite_choice(expression, randomnessProvider) {
		var alternativeIndex = randomnessProvider.randomInt(expression.alternatives.length);
		var chosenAlternative = expression.alternatives[alternativeIndex];
		return rewriteRule(chosenAlternative, randomnessProvider);
	};

	check(typeof expression.type === "string", "Invalid expression");
	var expressionType = expression.type;
	check(rewriteFunctions.hasOwnProperty(expressionType), "Unknown expression type");
	var rewriteFunction = rewriteFunctions[expressionType];
	return rewriteFunction(expression, randomnessProvider);
};

LanguageGenerator.buildGenerator = function(grammar) {
	var generator = {};
	// Preprocess grammar.
	check((grammar.type === "grammar") && grammar.hasOwnProperty("startRule") &&
		grammar.hasOwnProperty("rules"),
		"Require PEG grammar to build language generator");
	generator.startSymbol = grammar.startRule;
	// --create dictionary of rules: {'symbol name': expression_it_expands_to}.
	var rules = {};
	grammar.rules.forEach(function(element, index, array) {
		check((element.type === "rule") && (typeof element.name === "string") &&
			element.hasOwnProperty("expression"), "Encountered invalid rule");
		check(!rules.hasOwnProperty(element.name), "Should not have duplicate rule names");
		rules[element.name] = element.expression;
	});
	generator.rules = rules;

	// Returns sentence after performing at most maxRewritesCount rewrites.
	// Returns null if wasn't able to rewrite all nonterminal symbols.
	generator.generateSentence = function(maxRewritesCount, randomnessProvider) {
		randomnessProvider = (randomnessProvider || DefaultRandomnessProvider);
		var rewritesCount = 0;
		var sentence = makeNode(NONTERMINAL_SYMBOL, this.startSymbol);
		// Collect non-terminals.
		var nonterminals = collectLeavesOfType(sentence, NONTERMINAL_SYMBOL);
		while (rewritesCount < maxRewritesCount) {
			// Pick non-terminal.
			if (0 == nonterminals.length) {
				break;
			}
			var symbolIndex = randomnessProvider.randomInt(nonterminals.length);
			var nodeToRewrite = nonterminals[symbolIndex];

			// Rewrite picked non-terminal.
			var expression = this.rules[nodeToRewrite.value];
			nodeToRewrite.children = rewriteRule(expression, randomnessProvider);
			rewritesCount++;

			// Prepare for the next loop of cycle.
			nonterminals = collectLeavesOfType(sentence, NONTERMINAL_SYMBOL);
		}
		var result = null;
		if (0 == nonterminals.length) {
			// Join terminals into a single string.
			var terminals = collectLeavesOfType(sentence, TERMINAL_SYMBOL);
			var terminalValues = terminals.map(function(element, index, array) {
				return element.value;
			});
			result = terminalValues.join("");
		}
		return result;
	};
	return generator;
};

return LanguageGenerator;
})();

if (typeof module !== "undefined") {
	module.exports = LanguageGenerator;
}

//TODO: document generateSentence

// Example of usage:
// var data = "42";
// var grammar = PEG.parser.parse(data);
// var generator = LanguageGenerator.buildGenerator(grammar);
// var sentence = generator.generateSentence(3);
