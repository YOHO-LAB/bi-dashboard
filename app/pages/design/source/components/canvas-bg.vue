<template>
    <canvas
        id="sourceCanvas"
        :style="canvasStyle"
        @mousemove="onMouseMove"
        @click="onClick"></canvas>
</template>

<script>
import _ from 'lodash';
import {nearToLine, arrowLine, getLineRect} from './utils';
import {DebounceUtil} from 'utils';
import {mapState} from 'vuex';

const lineWidth = 0.5;
const bgColor = '#EEEEEE';
const lineColor = '#666';
const lineFocusColor = '#000';

export default {
  name: 'CanvasBg',
  computed: {
    ...mapState(['database']),
    canvasStyle() {
      const style = {};

      if (this.lineFocus) {
        style.cursor = 'pointer';
      }
      return style;
    }
  },
  data() {
    return {
      lineFocus: false
    };
  },
  watch: {
    ['database.mousePos']({x, y}) {
      if (!this.database.viewRelations.length || !this.database.viewMode) {
        return;
      }
      if (this.database.viewMode === 'move') {
        const {id} = this.database.moveData;

        if (!_.some(this.database.viewRelations, v => v.from === id || v.to === id)) {
          return;
        }
      }
      this.render({x, y});
    },

    ['database.viewRelations']() {
      this.render();
    }
  },
  mounted() {
    const $canvas = document.querySelector('#sourceCanvas');

    this.ctx = $canvas.getContext('2d');
    this.canvas = $canvas;
    this.resize();
    window.addEventListener('resize', this.resize);
    this.mouseMove = DebounceUtil.throttle(100, this.mouseMoveEvent);
  },
  destroyed() {
    window.removeEventListener('resize', this.resize);
  },
  methods: {
    onClick() {
      const findRelation = _.find(this.relations, r => r.status === 'focus');

      if (findRelation) {
        this.$emit('on-click-relation', findRelation);
      }
    },
    onMouseMove(evt) {
      this.mouseMove(evt);
    },
    mouseMoveEvent({offsetX, offsetY}) {
      _.each(this.relations, (rela) => {
        if (rela.rect) {
          const [p1, p2, p3, p4] = rela.rect;
          const lines = [[p1, p2], [p2, p3], [p3, p4], [p4, p1]];
          const crossLines = _.filter(lines, ([[, sy], [, ey]]) =>
            (offsetY >= sy && offsetY < ey) || (offsetY >= ey && offsetY < sy));

          const corssXs = _.map(crossLines, ([[sx, sy], [ex, ey]]) => {
            return sx + (offsetY - sy) * (ex - sx) / (ey - sy);
          });

          const less = _.filter(corssXs, x => x <= offsetX).length;
          const more = _.filter(corssXs, x => x >= offsetX).length;
          const focusLines = _.filter(this.relations, r => r.status === 'focus');

          if (more % 2 && less % 2) {
            if (focusLines.length > 0) {
              _.each(focusLines, line => {
                line.status = 'normal';
              });
            }
            rela.status = 'focus';
            this.lineFocus = true;
            this.refresh();
            return false;
          } else {
            const needRefresh = _.some(focusLines, r => r === rela);

            rela.status = 'normal';
            if (needRefresh) {
              this.lineFocus = false;
              this.refresh();
            }
          }
        }
      });
    },
    resize() {
      const {width, height} = this.canvas.parentNode.getBoundingClientRect();

      window.devicePixelRatio = window.devicePixelRatio || 1;
      if (window.devicePixelRatio) {
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        this.canvas.width = width * window.devicePixelRatio;
        this.canvas.height = height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
      this.$nextTick(() => {
        this.render();
      });
    },
    clearCanvas() {
      this.ctx.fillStyle = bgColor;
      this.ctx.beginPath();
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.closePath();
    },
    render({x, y} = {}) {
      this.relations = [];
      this.tables = [];
      const unRelation = _.find(this.database.viewRelations, v => !v.to);

      if (unRelation) {
        this.renderUnRelation({relation: unRelation, x, y});
      }
      const relations = _.filter(this.database.viewRelations, v => v.to);

      if (relations.length) {
        this.renderRelation(relations);
      }
      this.refresh();
    },
    renderUnRelation({relation, x, y}) {
      const find = _.find(this.database.viewTables, v => v.id === relation.from);

      if (find) {
        const {canvasReact} = this.database.relationData;
        const destX = x - canvasReact.x;
        const destY = y - canvasReact.y;
        const oriX = find.rect.x + find.rect.width / 2;
        const oriY = find.rect.y + find.rect.height / 2;

        this.relations.push({
          line: [[oriX, oriY], [destX, destY]]
        });
      }
    },
    renderRelation(viewRelations) {
      let directs = [];
      const relations = [];

      _.each(viewRelations, r => {
        const {from, to} = r;

        const formTable = _.find(this.database.viewTables, v => v.id === from);
        const toTable = _.find(this.database.viewTables, v => v.id === to);

        const {sx, sy, ex, ey, sDirect, eDirect} = nearToLine([formTable.rect, toTable.rect]);
        const start = [sx, sy];
        const end = [ex, ey];

        relations.push(Object.assign({
          line: [start, end]
        }, r));
        directs = directs.concat([
          {id: from, pos: start, xsort: sx + ex, ysort: sy + ey, direct: sDirect, key: `${from}${sDirect}`},
          {id: to, pos: end, xsort: sx + ex, ysort: sy + ey, direct: eDirect, key: `${to}${eDirect}`}]);
      });
      const lineGroups = _.filter(_.groupBy(directs, d => d.key), v => v.length > 1);

      _.each(lineGroups, g => {
        let offetStart = ((0 - _.parseInt(g.length / 2)) * 10);
        const direct = g[0].direct;

        _.each(_.sortBy(g, item => _.get(item, (direct === 'left' || direct === 'right') ? 'ysort' : 'xsort')), item => {
          if (item.direct === 'left' || item.direct === 'right') {
            item.pos[1] += offetStart;
          } else {
            item.pos[0] += offetStart;
          }
          offetStart += 10;
        });
      });

      _.each(relations, rela => {
        rela.rect = getLineRect(rela.line, 5);
        this.relations.push(rela);
      });
    },
    refresh() {
      this.clearCanvas();
      _.each(this.relations, rela => {
        this.renderLine(rela);
      });
    },
    renderLine({line, status}) {
      if (line.length > 1) {
        const ctx = this.ctx;
        let drawLines = [line];
        const arrowLines = arrowLine(line);

        drawLines = drawLines.concat(arrowLines);

        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        if (status === 'focus') {
          ctx.strokeStyle = lineFocusColor;
        } else {
          ctx.strokeStyle = lineColor;
        }
        _.each(drawLines, ([[x1, y1], [x2, y2]]) => {
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
        });
        ctx.stroke();
        ctx.closePath();
      }
    }
  }
};
</script>

<style>

</style>
