var PEG = require('pegjs');
var assert = require('assert');
var fs = require('fs'); // for loading files

// Read file contents
var data = fs.readFileSync('mus.peg', 'utf-8');

// Show the PEG grammar file
//console.log(data);

// Create parser
var parse = PEG.buildParser(data).parse;

// Do tests
// -- note
assert.deepEqual(parse("a4 100", "note"),
    {tag:"note", pitch:"a4", dur:100});

// -- rest
assert.deepEqual(parse("_ 200", "rest"),
    {tag:"rest", dur:200});

// -- seq
var expectedSequence =
    {tag:"seq",
    left:{tag:"note", pitch:"a4", dur:100},
    right:{tag:"note", pitch:"c5", dur:50}};
assert.deepEqual(parse("a4 100;c5 50", "sequence"),
    expectedSequence);
assert.deepEqual(parse("a4 100; c5 50", "sequence"),
    expectedSequence);
assert.deepEqual(parse("a4 100 ; c5 50", "sequence"),
    expectedSequence);
assert.deepEqual(parse("a4 100; c5 50; e4 250", "sequence"),
    {tag:"seq",
    left: {tag:"note", pitch:"a4", dur:100},
    right: {tag:"seq",
        left: {tag:"note", pitch:"c5", dur:50},
        right: {tag:"note", pitch:"e4", dur:250}}});
assert.deepEqual(parse("_ 100; a4 100", "sequence"),
    {tag:"seq",
    left: {tag:"rest", dur:100},
    right: {tag:"note", pitch:"a4", dur:100}});

// -- par
assert.deepEqual(parse("a4 100, c5 50", "parallel"),
    {tag:"par",
    left:{tag:"note", pitch:"a4", dur:100},
    right:{tag:"note", pitch:"c5", dur:50}});
assert.deepEqual(parse("a4 100, c5 50, e4 250", "parallel"),
    {tag:"par",
    left: {tag:"note", pitch:"a4", dur:100},
    right: {tag:"par",
        left: {tag:"note", pitch:"c5", dur:50},
        right: {tag:"note", pitch:"e4", dur:250}}});

// -- repeat
assert.deepEqual(parse("repeat 3 a4 100", "repeat"),
    {tag:"repeat", count:3,
    section: {tag:"note", pitch:"a4", dur:100}});

// -- parentheses and mix of seq & par & repeat
assert.deepEqual(parse("a4 100, c5 50; e4 250"),
    {tag:"par",
    left: {tag:"note", pitch:"a4", dur:100},
    right: {tag:"seq",
        left: {tag:"note", pitch:"c5", dur:50},
        right: {tag:"note", pitch:"e4", dur:250}}});
assert.deepEqual(parse("(a4 100, c5 50); e4 250"),
    {tag:"seq",
    left: {tag:"par",
        left: {tag:"note", pitch:"a4", dur:100},
        right: {tag:"note", pitch:"c5", dur:50}},
    right: {tag:"note", pitch:"e4", dur:250}});
// add repeat to the mix
assert.deepEqual(parse("repeat 3 a4 100; c5 50"),
    {tag:"repeat", count:3,
    section: {tag:"seq",
             left: {tag:"note", pitch:"a4", dur:100},
             right: {tag:"note", pitch:"c5", dur:50}}});
assert.deepEqual(parse("(repeat 3 a4 100); c5 50"),
    {tag:"seq",
    left: {tag:"repeat", count:3,
            section: {tag:"note", pitch:"a4", dur:100}},
    right: {tag:"note", pitch:"c5", dur:50}});

console.log('tests passed');
