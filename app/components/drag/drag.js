import {getSetCss} from './utils';
import Vue from 'vue';

class Drag {
  constructor() {
    this.status = '';
    this.$vue = new Vue();
    this.evtMouseMove = this._onMouseMove.bind(this);
    this.evtMouseUp = this._onMouseUp.bind(this);
    this.evtKeyDown = this._onKeyDown.bind(this);
    this.$on('will-drag', this._willDrag.bind(this));
    this.$on('drag-hover', this._dragHover.bind(this));
    this.$on('drag-up', this._dragUp.bind(this));
  }
  $on(...args) {
    return this.$vue.$on(...args);
  }
  $emit(...args) {
    return this.$vue.$emit(...args);
  }
  $off(...args) {
    return this.$vue.$off(...args);
  }
  _willDrag({id, value, el, copy}) {
    this.dragEl = el;
    this.dragValue = value;
    this.dragId = id;
    this.dragCopy = copy;
    this.status = 'willDrag';
    document.addEventListener('mousemove', this.evtMouseMove);
    document.addEventListener('mouseup', this.evtMouseUp);
    document.addEventListener('keydown', this.evtKeyDown);
  }
  _stopDrag() {
    delete this.dragEl;
    delete this.dragValue;
    delete this.dragId;
    delete this.dragCopy;
    this.status = '';
    document.removeEventListener('mousemove', this.evtMouseMove);
    document.removeEventListener('mouseup', this.evtMouseUp);
    document.removeEventListener('keydown', this.evtKeyDown);
    this.$emit('drag-stop');
    this._removeGhost();
  }
  _dragHover({value}) {
    if (value !== this.dragValue) {
      this.$emit(`drag-hover-${this.dragId}`, {
        id: this.dragId,
        fromValue: this.dragValue,
        toValue: value
      });
    }
    this._stopDrag();
  }
  _dragUp(payload) {
    if (payload) {
      const {id, value} = payload;

      this.$emit(`drag-up-${id}`, {
        fromId: this.dragId,
        toId: id,
        fromValue: this.dragValue,
        toValue: value,
        copy: this.dragCopy
      });
    }
    this._stopDrag();
  }
  _onKeyDown({keyCode}) {
    if (this.status === 'draging' && keyCode === 27) {
      this._stopDrag();
    }
  }
  _startDrag(evt) {
    if (!this.$ghost) {
      this.$ghost = this._appendGhost(this.dragEl);
      this.offsetX = evt.offsetX;
      this.offsetY = evt.offsetY;
    }
    this.$emit('drag-start', {id: this.dragId, value: this.dragValue});
  }
  _onMouseMove(evt) {
    if (this.status === 'willDrag') {
      this.status = 'draging';
      this._startDrag(evt);
    }
    if (this.status === 'draging') {
      this._moveGhost(evt);
    }
  }
  _onMouseUp() {
    if (this.status === 'draging') {
      this.$emit(`drag-up-${this.dragId}`, {
        fromId: this.dragId,
        fromValue: this.dragValue,
      });
      this._stopDrag();
    }
  }
  _appendGhost(dragEl) {
    const rect = dragEl.getBoundingClientRect();
    const css = getSetCss(dragEl);
    const ghostEl = dragEl.cloneNode(true);

    getSetCss(ghostEl, 'top', rect.top - parseInt(css.marginTop, 10));
    getSetCss(ghostEl, 'left', rect.left - parseInt(css.marginLeft, 10));
    getSetCss(ghostEl, 'width', rect.width);
    getSetCss(ghostEl, 'height', rect.height);
    getSetCss(ghostEl, 'opacity', '0.8');
    getSetCss(ghostEl, 'position', 'fixed');
    getSetCss(ghostEl, 'zIndex', '100000');
    getSetCss(ghostEl, 'pointerEvents', 'none');
    getSetCss(ghostEl, 'background-color', '#fff');

    document.body.appendChild(ghostEl);

    return ghostEl;
  }
  _moveGhost(evt) {
    const {x, y} = evt;
    const marginTop = getSetCss(this.$ghost, 'marginTop').replace('px', '');
    const marginLeft = getSetCss(this.$ghost, 'marginLeft').replace('px', '');

    getSetCss(this.$ghost, 'top', y - marginTop - this.offsetY);
    getSetCss(this.$ghost, 'left', x - marginLeft - this.offsetX);
  }
  _removeGhost() {
    if (!this.$ghost) {
      return;
    }
    this.$ghost.remove();
    delete this.$ghost;
  }
}

export default new Drag();
