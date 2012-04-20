var max = function(x, y) {
    if (x > y) {
        return x;
    } else {
        return y;
    }
};

var compileToResult = function(musexpr, startTime, result) {
    var endTime = startTime;
    if ('note' === musexpr.tag) {
        result.push({ tag: 'note', pitch: musexpr.pitch,
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
         left: { tag: 'note', pitch: 'c4', dur: 500 },
         right: { tag: 'note', pitch: 'd4', dur: 500 } } };

console.log(melody_mus);
console.log(compile(melody_mus));
