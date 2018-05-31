// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

import CodeMirror from 'codemirror';
import _ from 'lodash';
import Vue from 'vue';
import {Icon} from 'iview'; //eslint-disable-line

const vueHintRender = function(h) { //eslint-disable-line
  return (
    <li data-hint-id={`hintId_${1}`} class={{'bi-hint-item': true, 'CodeMirror-hint': true, 'CodeMirror-hint-active': this.active}}>
      {this.type === 'G' ? (<span class="hint-icon math">∫</span>) : ''}
      {this.type === 'D' ? (<span class="hint-icon dimension">Abc</span>) : ''}
      {this.type === 'M' ? (<span class="hint-icon measure">#</span>) : ''}
      {this.displayText}
    </li>
  );
};

let WORD = /[\w$]+/;

CodeMirror.registerHelper('hint', 'yohobi', function(editor, options) {
  let words = options && options.words || WORD;
  let cur = editor.getCursor(), curLine = editor.getLine(cur.line);
  let end = cur.ch, start = end;
  let ch;
  let result = [];
  const matchStr = str => word => {
    return word.title.toLowerCase().indexOf(str.toLowerCase()) >= 0 ||
            word.title.toUpperCase().indexOf(str.toUpperCase()) >= 0;
  };

  while (start && (ch = curLine.charAt(start - 1))) {
    const filter = _.filter(words, matchStr(ch));

    if (filter.length) {
      --start;
      continue;
    }
    break;
  }

  if (end > start) {
    result = _.filter(words, matchStr(curLine.substring(start, end)));
  }
  result = _.map(result, (r, index) => {
    return {
      text: r.type === 'G' ? `${r.title}()` : `[${r.title}]`,
      displayText: r.alias,
      type: r.type,
      active: index === 0,
      render(el, self, data) {
        const vueHint = new Vue({
          data,
          render: vueHintRender
        });

        vueHint.$mount(el);
        vueHint.$el.hintId = index;
      }
    };
  });

    const data = { list: result, from: CodeMirror.Pos(cur.line, start), to: CodeMirror.Pos(cur.line, end) }; //eslint-disable-line

  CodeMirror.on(data, 'pick', (c) => {
    if (c.type === 'G') {
      editor.execCommand('goCharLeft');
    }
  });

    return data; //eslint-disable-line
});
