var PEG = require('pegjs');
var assert = require('chai').assert;
var fs = require('fs'); // for loading files

// Read file contents
var data = fs.readFileSync('scheem.peg', 'utf-8');

// Show the PEG grammar file
//console.log(data);

// Create my parser
var parse = PEG.buildParser(data).parse;

// Do tests
suite('expression', function() {
    test('atom', function() {
        assert.equal( parse("atom"), "atom" );
    });
    test('integer number', function() {
        assert.deepEqual( parse("13"), 13 );
        assert.deepEqual( parse("012"), 12 ); // octal numbers aren't supported
        assert.deepEqual( parse("-7"), -7 );
        assert.deepEqual( parse("0"), 0 );
        assert.deepEqual( parse("-0"), 0 );
    });
    test('float number', function() {
        assert.deepEqual( parse("4.2"), 4.2 );
        assert.deepEqual( parse("4."), 4.0 );
        assert.deepEqual( parse(".2"), 0.2 );
        assert.deepEqual( parse("-4.2"), -4.2 );
        assert.deepEqual( parse("-4."), -4.0 );
        assert.deepEqual( parse("-.2"), -0.2 );
        assert.deepEqual( parse("0.0"), 0.0 );
        assert.deepEqual( parse("0."), 0.0 );
        assert.deepEqual( parse(".0"), 0.0 );
        assert.deepEqual( parse("-0.0"), 0.0 );
        assert.deepEqual( parse("-0."), 0.0 );
        assert.deepEqual( parse("-.0"), 0.0 );
        // Scientific notation isn't supported
    });
    test('atom with digits and symbols special for numbers', function() {
        assert.deepEqual( parse("y2"), "y2" );
        assert.throws(function() {
            // hexadecimal numbers aren't supported, identifiers cannot start with digit
            parse("0x0BAD1DEA");
        });
        assert.deepEqual( parse("-none-"), "-none-" );
        assert.deepEqual( parse(".dots"), ".dots" );
    });
    test('atom with special symbols', function() {
        assert.equal( parse("+"), "+" );
    });
    test('list', function() {
        assert.deepEqual( parse("(+ x 3)"), ["+", "x", 3] );
    });
    test('nested list', function() {
        assert.deepEqual( parse("(+ 1 (f x 3 y))"),
            ["+", 1, ["f", "x", 3, "y"]] );
    });
    test('single atom in parentheses', function() {
        assert.deepEqual( parse("(x)"), ["x"] );
    });
    test('single atom in nested parentheses', function() {
        assert.deepEqual( parse("((x))"), [["x"]] );
    });
});
// assert.equal( parse(""), undefined);

suite('whitespace', function() {
    test('2 spaces in atom list', function() {
        assert.deepEqual( parse("(a  b)"), ["a", "b"] );
    });
    test('spaces are required to separate', function() {
        assert.deepEqual( parse("(ab)"), ["ab"] );
    });
    test('spaces around parentheses', function() {
        assert.deepEqual( parse(" ( a b  )"), ["a", "b"] );
    });
    test('tabs', function() {
        assert.deepEqual( parse("(a\tb)"), ["a", "b"] );
    });
    test('newlines', function() {
        assert.deepEqual( parse("(a\nb)"), ["a", "b"] );
    });
    test('tabs and newlines', function() {
        assert.deepEqual( parse(" (a \nb\t )\n"), ["a", "b"] );
    });
});
// XFAIL - vsapsai: don't know how to implement it
//assert.equal( parse(" atom\n"), "atom" );

// -- quote support
suite('quote', function() {
    test('atom', function() {
        assert.deepEqual( parse("'x"), ["quote", "x"] );
    });
    test('list', function() {
        assert.deepEqual( parse("'(a b)"), ["quote", ["a", "b"]] );
    });
    test('quote', function() {
        // this is ridiculous but correct
        assert.deepEqual( parse(" ''x"), ["quote", ["quote", "x"]] );
    });
    test('with space', function() {
        // don't like space between ' and (, but not gonna fight with it
        assert.deepEqual( parse("' (a b)"), ["quote", ["a", "b"]] );
    });
});

// -- comments support
suite('comments', function() {
    test('immediately', function() {
        assert.deepEqual( parse("(a b);;comment"), ["a", "b"] );
    });
    test('whitespace before comment', function() {
        assert.deepEqual( parse("(a b) ;;comment"), ["a", "b"] );
    });
    test('whitespace after comment', function() {
        assert.deepEqual( parse("(+ a ;; comment\n\tb)"), ["+", "a", "b"] );
    });
    test('comment with valid code', function() {
        assert.deepEqual( parse("(a;;b)\nc)"), ["a", "c"] );
    });
});
