var PEG = require('pegjs');
var assert = require('assert');
var fs = require('fs'); // for loading files

// Read file contents
var data = fs.readFileSync('scheem.peg', 'utf-8');

// Show the PEG grammar file
console.log(data);

// Create my parser
var parse = PEG.buildParser(data).parse;

// Do tests
assert.deepEqual( parse("(a b c)"), ["a", "b", "c"] );
// assert.equal( parse(""), undefined);
assert.equal( parse("atom"), "atom" );
assert.equal( parse("+"), "+" );
assert.deepEqual( parse("(+ x 3)"), ["+", "x", "3"] );
assert.deepEqual( parse("(+ 1 (f x 3 y))"), ["+", "1", ["f", "x", "3", "y"]] );
// -- single expression in parentheses
assert.deepEqual( parse("(x)"), ["x"] );
assert.deepEqual( parse("((x))"), [["x"]] );

// -- variable number of spaces between subexpressions in expression
assert.deepEqual( parse("(a  b)"), ["a", "b"] );
assert.deepEqual( parse("(ab)"), ["ab"] );
// -- spaces around parentheses and atoms
assert.deepEqual( parse(" ( a b  )"), ["a", "b"] );
//assert.equal( parse(" atom\n"), "atom" ); // XFAIL - vsapsai: don't know how to implement it
// -- tabs and newlines are allowed too
assert.deepEqual( parse("(a\tb)"), ["a", "b"] );
assert.deepEqual( parse("(a\nb)"), ["a", "b"] );
assert.deepEqual( parse(" (a \nb\t )\n"), ["a", "b"] );

// -- quote support
assert.deepEqual( parse("'x"), ["quote", "x"] );
assert.deepEqual( parse("'(a b)"), ["quote", ["a", "b"]] );
assert.deepEqual( parse(" ''x"), ["quote", ["quote", "x"]] ); // this is ridiculous but correct
assert.deepEqual( parse("' (a b)"), ["quote", ["a", "b"]] ); // don't like space between ' and (, but not gonna fight with it

// -- comments support
assert.deepEqual( parse("(a b);;comment"), ["a", "b"] );
assert.deepEqual( parse("(a b) ;;comment"), ["a", "b"] ); // whitespace before comment
assert.deepEqual( parse("(+ a ;; comment\n\tb)"), ["+", "a", "b"] ); // whitespace after comment
assert.deepEqual( parse("(a;;b\nc)"), ["a", "c"] );
