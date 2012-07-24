var PEG = require('pegjs');
var fs = require('fs');
var LangGen = require("./language_generator");

var data = fs.readFileSync('test_grammar.peg', 'utf-8');
var grammar = PEG.parser.parse(data);
var generator = LangGen.buildGenerator(grammar);
var s = generator.generateSentence(10);
console.log(s);
