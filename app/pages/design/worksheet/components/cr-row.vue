<template>
    <div class="cr-row">
        <p class="title">{{title}}</p>
        <div class="rows">
            <drag-box
                :inline="true"
                :id="dataType"
                :allow-filter="allowFilter"
                @drag-up="onDropUp">
                <drag-box-item
                    v-for="item in value"
                    :value="item"
                    :key="item.title">
                    <drag-drop-down-box
                        v-if="item.categorys"
                        class="drop-row-item drop-light"
                        :value="item"
                        :menu="dataType === 'column' ? GETTER_COLUMN_MENU(item) : GETTER_VALUE_MENU(item)"
                        @on-remove="removeValue">
                        <i-icon class="cate-icon" type="plus"
                            v-if="item.categorys.length > item.level + 1"
                            @click.native.stop="onExpandCategory(item)"></i-icon>
                        {{getCategoryTitle(item)}}
                    </drag-drop-down-box>
                    <drag-drop-down-box
                        v-else
                        class="drop-row-item drop-light"
                        :value="item"
                        :menu="dataType === 'column' ? GETTER_COLUMN_MENU(item) : GETTER_VALUE_MENU(item)"
                        @on-remove="removeValue"
                        @on-value-type="onValueOptionChange"
                        @on-format-type="onValueOptionChange">
                        <i-icon class="cate-icon" type="minus"
                            v-if="item.parentCategory"
                            @click.native.stop="onBackCategory(item)"></i-icon>
                        {{item.alias || item.title}}
                    </drag-drop-down-box>
                </drag-box-item>
            </drag-box>
        </div>
    </div>
</template>

<script>
import _ from 'lodash';
import {mapState, mapGetters} from 'vuex';
import * as Types from 'store/worksheet/types';

export default {
  name: 'CrCardRow',
  props: {
    title: String,
    dataType: String,
    dragRecType: Array,
    value: Array
  },
  computed: {
    ...mapState(['worksheet']),
    ...mapGetters([Types.GETTER_VALUE_MENU, Types.GETTER_COLUMN_MENU])
  },
  methods: {
    onDropUp(payload) {
      this.$store.commit(Types.DRAG_VALUE_ACCPET, payload);
      this.$emit('on-change');
    },
    removeValue({value}) {
      this.$store.commit(Types.REMOVE_VALUE, {
        fromType: _.toUpper(this.dataType),
        value
      });
      this.$emit('on-change');
    },
    getCategoryTitle(value) {
      if (value.categorys[value.level]) {
        return value.categorys[value.level].alias || value.categorys[value.level].title;
      }
      return '';
    },
    allowFilter({value}) {
      if (value.type === 'D' || (this.dataType === 'row' && value.type === 'M')) {
        return true;
      }
    },
    onExpandCategory(value) {
      this.$store.commit(Types.EXPAND_CATEGORY, {value, type: this.dataType});
      this.$emit('on-change', {value, type: this.dataType});
    },
    onBackCategory(value) {
      this.$store.commit(Types.BACK_CATEGORY, {value, type: this.dataType});
      this.$emit('on-change', {value, type: this.dataType});
    },
    onValueOptionChange({menu, value}) {
      const changeVal = value.options[menu.target] !== menu.val ? menu.val : '';

      if (menu.target === 'valueType' && !changeVal) {
        return;
      }
      this.$store.commit(Types.CHANGE_VALUE_OPTION, {value, target: menu.target, val: changeVal});
      this.$emit('on-change');
    },
  },
};
</script>

<style lang="scss">
.cr-row {
  display: flex;
  font-size: 12px;
  border-bottom: solid 1px #dddee1;
  margin-bottom: 10px;

  .title {
    width: 100px;
    border-right: solid 1px #dddee1;
    padding-left: 20px;
    line-height: 30px;
    font-weight: 700;
  }

  .rows {
    flex: 1;
    display: flex;
    vertical-align: middle;
    min-height: 31px;

    .drag-box {
      overflow-y: hidden;
    }
  }

  .drop-row-item {
    .cate-icon {
      font-size: 12px;
      width: 15px;
      height: 15px;
      text-align: center;
      line-height: 13px;
      display: inline-block;
      border: solid 1px #fff;
      transform: scale(0.6);
      transform-origin: left center;

      &:hover {
        color: #ececec;
      }
    }
  }
}
</style>
