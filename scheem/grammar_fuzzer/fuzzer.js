var PEG = require('pegjs');
var fs = require('fs');
var LangGen = require("./language_generator");

var data = fs.readFileSync('test_grammar.peg', 'utf-8');
var grammar = PEG.parser.parse(data);
var generator = LangGen.buildGenerator(grammar);
var parser = PEG.buildParser(data);

for (var i = 0; i < 10; i++) {
	var sentence = generator.generateSentence(10);
	if (sentence !== null) {
		try {
			parser.parse(sentence);
		}
		catch (e) {
			console.log("Failed to parse: " + sentence);
		}
	}
}
