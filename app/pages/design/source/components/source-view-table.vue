<template>
    <div
        class="table-box"
        :style="boxStyle">
        <div
            class="table-name"
            @mousedown.stop.prevent="onMouseDown"
            @mouseup.stop.prevent="onMouseUp">
            <div class="title" :title="value.tableName">
                <b>{{value.tableName}}</b>
                <p class="scheme-name">scheme:{{value.schemeName}}</p>
            </div>
            <div class="extra">
                <i-dropdown class="measure-dropdown" trigger="click">
                    <i-icon type="arrow-down-b"></i-icon>
                    <i-dropdown-menu slot="list">
                        <i-dropdown-item @click.native.stop.prevent="onClickRelation" name="relation">关联</i-dropdown-item>
                        <i-dropdown-item @click.native.stop.prevent="onClickRemove" name="remove">移除</i-dropdown-item>
                    </i-dropdown-menu>
                </i-dropdown>
            </div>
        </div>
        <div class="table-columns">
            <ul>
                <li v-for="col in value.columns" :key="col.title">
                    <i-tooltip class="title" placement="right-start" v-if="col.comment">
                        <span>{{col.title}}</span>
                        <i-icon type="navicon"></i-icon>
                        <div slot="content">
                            {{col.comment}}
                        </div>
                    </i-tooltip>
                    <span v-else class="title">{{col.title}}</span>
                    <span class="field-type">{{col.fieldType}}</span>
                </li>
            </ul>
        </div>
        </div>
</template>

<script>
import * as Types from 'store/database/types';
import {mapState} from 'vuex';

export default {
  name: 'SourceViewTable',
  props: {
    value: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      moveing: false,
    };
  },
  computed: {
    ...mapState(['database']),
    boxStyle() {
      const style = {};

      style.left = `${this.value.rect.x}px`;
      style.top = `${this.value.rect.y}px`;
      style.width = `${this.value.rect.width}px`;
      style.height = `${this.value.rect.height}px`;
      return style;
    }
  },
  methods: {
    onMouseDown({x: startX, y: startY}) {
      if (this.database.viewMode === 'relation') {
        const {id} = this.database.relationData;

        this.$emit('on-relation', {from: id, to: this.value.id});
      } else {
        this.$store.commit(Types.START_TABLE_MOVE, {id: this.value.id, startX, startY});
      }
    },
    onMouseUp() {
      if (this.database.viewMode === 'move') {
        this.$store.commit(Types.END_TABLE_MOVE);
      }
    },
    onMouseOut(evt) {
      if (this.database.viewMode === 'move' && !this.$el.contains(evt.relatedTarget)) {
        this.onMouseUp(evt);
      }
    },
    onClickRelation() {
      const el = this.$el.parentNode;
      const canvasReact = el.getBoundingClientRect();

      this.$store.commit(Types.START_TABLE_RELATION, {id: this.value.id, canvasReact});
    },
    onClickRemove() {
      this.$store.dispatch(Types.REMOVE_SOURCE_TABLE, {id: this.value.id});
    }
  }
};
</script>

<style lang="scss">
$tableBoxBdColor: #9e9e9e;

.table-box {
  position: absolute;
  z-index: 2;
  width: 250px;
  border: 1px solid $tableBoxBdColor;
  display: flex;
  flex-direction: column;
  background-color: #fff;

  .table-name {
    height: 40px;
    width: 100%;
    border-bottom: 1px solid $tableBoxBdColor;
    background-color: #e0e0e0;
    display: flex;
    cursor: pointer;

    .title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      padding-left: 5px;
    }

    .extra {
      width: 30px;

      i {
        width: 30px;
        height: 40px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    b {
      font-size: 15px;
    }

    .scheme-name {
      font-size: 12px;
      line-height: 13px;
      color: #757575;
    }
  }

  .table-columns {
    flex: 1;
    overflow-y: auto;

    li {
      display: flex;
      border-bottom: 1px solid $tableBoxBdColor;
      padding-left: 5px;
      padding-right: 5px;
      line-height: 23px;

      &:last-child {
        border: none;
      }

      .title {
        flex: 1;

        .ivu-icon {
          color: #757575;
          font-size: 11px;
        }
      }

      .field-type {
        width: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: right;
        color: #757575;
      }
    }
  }
}
</style>
