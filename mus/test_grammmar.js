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
assert.deepEqual(parse("a4 100", "note"),
    {tag:"note", pitch:"a4", dur:100});

console.log('tests passed');
