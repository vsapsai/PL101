var PEG = require('pegjs');
var assert = require('chai').assert;
var LangGen = require("../language_generator");

function makeTestRandomnessProvider(values) {
    var result = {index: 0, values: values};
    result.randomInt = function() {
        return this.values[this.index++];
    };
    return result;
};

function buildLanguageGeneratorFromRawGrammarData(data) {
    var grammar = PEG.parser.parse(data);
    var generator = LangGen.buildGenerator(grammar);
    return generator;
};

function generateSentenceFromRawGrammarData(data, randomValues, maxRewritesCount) {
    maxRewritesCount = maxRewritesCount || 10;
    var generator = buildLanguageGeneratorFromRawGrammarData(data);
    var randomnessProvider;
    if (randomValues !== undefined) { 
        randomnessProvider = makeTestRandomnessProvider(randomValues);
    }
    var sentence = generator.generateSentence(maxRewritesCount, randomnessProvider);
    return sentence;
};

suite('Language Generator', function() {
    test('literal', function() {
        assert.equal(generateSentenceFromRawGrammarData('start = "42"'), "42");
    });
    test('rule reference', function() {
        assert.equal(generateSentenceFromRawGrammarData('start = number \n number = "42"'), "42");
    });
    test('choice', function() {
        assert.equal(generateSentenceFromRawGrammarData('start = "1" / "2"', [0, 0]), "1");
        assert.equal(generateSentenceFromRawGrammarData('start = "1" / "2"', [0, 1]), "2");
    })
});
