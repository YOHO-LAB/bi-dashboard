<template>
    <div class="source-view">
        <drag-box id="view-box" :allow="['table']" @drag-up="onDropUp">
            <div
                class="source-box"
                @mousemove="onMouseMove"
                @mousedown="onMouseDown">
                <canvas-bg
                    class="canvas-bg"
                    @on-click-relation="onClickRelation"></canvas-bg>
                <source-view-table
                    :value="table"
                    v-for="(table, index) in database.viewTables"
                    :key="index"
                    @on-relation="onRelation">
                </source-view-table>
            </div>
        </drag-box>
        <modal-relation
            ref="modalRelation"
            @on-save-relation="onSaveRelation"
            @on-del-relation="onDelRelation"></modal-relation>
    </div>
</template>

<script>
import _ from 'lodash';
import * as Types from 'store/database/types';
import {mapState} from 'vuex';
import CanvasBg from './canvas-bg';
import ModalRelation from './modal-relation';
import SourceViewTable from './source-view-table';

export default {
  name: 'SourceViewBox',
  computed: {
    ...mapState(['database']),
  },
  data() {
    return {
      moveing: false,
      currentTableId: 0
    };
  },
  methods: {
    onDropUp({fromValue}) {
      if (fromValue) {
        this.$store.dispatch(Types.APPEND_SOURCE_TABLE, fromValue);
      }
    },
    onMouseMove(evt) {
      if (this.database.viewMode) {
        this.$store.commit(Types.MOVE_MOUSE_SOURCE, {x: evt.x, y: evt.y});
        evt.preventDefault();
      }
    },
    onMouseDown() {
      if (this.database.viewMode === 'relation') {
        this.$store.commit(Types.END_TABLE_RELATION);
      } else if (this.database.viewMode === 'move') {
        this.$store.commit(Types.END_TABLE_MOVE);
      }
    },
    onRelation({from, to}) {
      if (_.some(this.database.viewRelations, r => r.to === from && r.from === to)) {
        this.$store.commit(Types.END_TABLE_RELATION);
        return this.$Message.warning('表之间不可循环关联');
      }
      if (_.some(this.database.viewRelations, r => r.from === from && r.to === to)) {
        this.$store.commit(Types.END_TABLE_RELATION);
        return this.$Message.warning('表之间不可重复关联');
      }
      this.$refs.modalRelation.show({from, to});
    },
    onSaveRelation(relation) {
      this.$store.commit(Types.ADD_TABLE_RELATION, relation);
    },
    onClickRelation(relation) {
      this.$refs.modalRelation.show(relation);
    },
    onDelRelation(relation) {
      this.$store.commit(Types.DELETE_TABLE_RELATION, relation);
    }
  },
  components: {SourceViewTable, CanvasBg, ModalRelation}
};
</script>

<style lang="scss">
.source-view {
  overflow: hidden;
  background-color: #eee;

  .ivu-card-body {
    padding: 0;
  }

  .source-box {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .canvas-bg {
    position: absolute;
    z-index: 1;
  }
}
</style>
