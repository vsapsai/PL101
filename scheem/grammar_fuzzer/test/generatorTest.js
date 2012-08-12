var PEG = require('pegjs');
var assert = require('chai').assert;
var LangGen = require("../language_generator");

function buildLanguageGeneratorFromRawGrammarData(data) {
    var grammar = PEG.parser.parse(data);
    var generator = LangGen.buildGenerator(grammar);
    return generator;
};

function generateSentenceFromRawGrammarData(data, maxRewritesCount) {
    maxRewritesCount = maxRewritesCount || 10;
    var generator = buildLanguageGeneratorFromRawGrammarData(data);
    var sentence = generator.generateSentence(maxRewritesCount);
    return sentence;
};

suite('Language Generator', function() {
    test('literal', function() {
        assert.equal(generateSentenceFromRawGrammarData('start = "42"'), "42");
    });
});
