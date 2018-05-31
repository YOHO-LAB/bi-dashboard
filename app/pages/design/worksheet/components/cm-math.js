import CodeMirror from 'codemirror';

CodeMirror.defineMode('yohobi', function() {
  const normal = (stream) => {
    let ch = stream.next();

    if (stream.eatSpace()) {
      return null;
    }
    if (ch === '[') {
      stream.eatWhile(/[^\]]/);
      stream.next();
      return 'field';
    }
    if (/\b\w/.test(ch)) {
      const m = stream.match(/(\w*\([^)]*\))/, false);

      if (m) {
        stream.skipTo('(');
        return 'math';
      }
    }
    return null;
  };

  return {
    startState: function(basecol) {
      return {basecol: basecol || 0, indentDepth: 0, cur: normal};
    },
    token: function(stream, state) {
      return state.cur(stream, state);
    }
  };
});

CodeMirror.defineMIME('text/x-bi', 'bi');
