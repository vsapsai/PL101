var LanguageGenerator = (function() {

var LanguageGenerator = {
	VERSION: "0.1.0",
};

LanguageGenerator.buildGenerator = function(grammar) {
	var generator = {};
	// Preprocess grammar.
	check((grammar.type === "grammar") && grammar.hasOwnProperty("startRule") &&
		grammar.hasOwnProperty("rules"),
		"Require PEG grammar to build language generator");
	generator.startRule = grammar.startRule;
	var rules = {};
	grammar.rules.forEach(function(element, index, array) {
		check((element.type === "rule") && (typeof element.name === "string") &&
			element.hasOwnProperty("expression"), "Encountered invalid rule");
		check(!rules.hasOwnProperty(element.name), "Should not have duplicate rule names");
		rules[element.name] = element.expression;
	});

	generator.generateWord = function(maxLength, randomnessProvider) {
		//TODO: implement
	};
	return generator;
};

var check = function(condition, errorDetails) {
	if (!condition) {
		throw new Error(errorDetails);
	}
};

return LanguageGenerator;
})();

if (typeof module !== "undefined") {
	module.exports.LanguageGenerator = LanguageGenerator;
}

//TODO: document generateWord

// Example of usage:
// var data = "42";
// var grammar = PEG.parser.parse(data);
// var generator = LanguageGenerator.buildGenerator(grammar);
// var word = generator.generateWord(3);
