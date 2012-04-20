var max = function(x, y) {
    if (x > y) {
        return x;
    } else {
        return y;
    }
};

var MIDINoteNumber = function (pitch) {
    var noteOffsets = { 'c': 0, 'd': 2, 'e': 4, 'f': 5, 'g': 7, 'a': 9, 'b': 11};
    var octave = parseInt(pitch[1]);
    var baseNumber = 12 * (octave + 1);
    var offset = noteOffsets[pitch[0]];
    return baseNumber + offset;
}

var compileToResult = function(musexpr, startTime, result) {
    var endTime = startTime;
    if ('note' === musexpr.tag) {
        result.push({ tag: 'note', pitch: MIDINoteNumber(musexpr.pitch),
                     start: startTime, dur: musexpr.dur });
        endTime = endTime + musexpr.dur;
    } else if ('rest' === musexpr.tag) {
        endTime = endTime + musexpr.duration;
    } else if ('seq' === musexpr.tag) {
        endTime = compileToResult(musexpr.left, startTime, result);
        endTime = compileToResult(musexpr.right, endTime, result);
    } else if ('par' === musexpr.tag) {
        var leftEndTime = compileToResult(musexpr.left, startTime, result);
        var rightEndTime = compileToResult(musexpr.right, startTime, result);
        endTime = max(leftEndTime, rightEndTime);
    } else if ('repeat' === musexpr.tag) {
        var i = 0;
        while (i < musexpr.count) {
            endTime = compileToResult(musexpr.section, endTime, result);
            i++;
        }
    }
    return endTime;
};


var compile = function(musexpr) {
    var result = [];
    compileToResult(musexpr, 0, result);
    return result;
};

var melody_mus = 
    { tag: 'seq',
      left: 
       { tag: 'seq',
         left: { tag: 'note', pitch: 'a4', dur: 250 },
         right: { tag: 'note', pitch: 'b4', dur: 250 } },
      right:
       { tag: 'seq',
         left: { tag: 'repeat',
                section: { tag: 'note', pitch: 'c4', dur: 250 },
                count: 3 },
         right: { tag: 'note', pitch: 'd4', dur: 500 } } };

console.log(melody_mus);
console.log(compile(melody_mus));
