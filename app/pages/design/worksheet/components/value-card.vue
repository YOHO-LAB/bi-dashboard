<template>
    <i-card class="value-card flex-card">
        <p slot="title">值</p>
        <drag-box
            id="value"
            :allow-filter="allowFilter"
            @drag-up="onDropUp">
            <drag-box-item
                v-for="value in worksheet.values"
                :value="value"
                :key="value.title">
                <drag-drop-down-box
                    class="drop-light"
                    :value="value"
                    :menu="GETTER_VALUE_MENU(value)"
                    @on-remove="removeValue"
                    @on-value-type="onValueOptionChange"
                    @on-format-type="onValueOptionChange">
                    {{getValueLabel(value)}}
                </drag-drop-down-box>
            </drag-box-item>
        </drag-box>
    </i-card>
</template>

<script>
import _ from 'lodash';
import {mapState, mapGetters} from 'vuex';
import * as Types from 'store/worksheet/types';

export default {
  name: 'ValueCard',
  data() {
    return {
      dataType: 'VALUE'
    };
  },
  computed: {
    ...mapState(['worksheet']),
    ...mapGetters([Types.GETTER_VALUE_MENU, Types.GETTER_CALC_MATH])
  },
  methods: {
    onDropUp(payload) {
      this.$store.commit(Types.DRAG_VALUE_ACCPET, payload);
      this.$emit('on-change');
    },
    getValueLabel(value) {
      const find = _.find(this.GETTER_CALC_MATH, math => math.title === value.options.valueType || 'SUM');
      const label = value.alias || value.title;

      return find ? `${find.label}(${label})` : label;
    },
    removeValue({value}) {
      this.$store.commit(Types.REMOVE_VALUE, {
        fromType: this.dataType,
        value
      });
      this.$emit('on-change');
    },
    dragEnd({fromType, value, remove}) {
      if (remove) {
        this.$store.commit(Types.REMOVE_VALUE, {fromType, value});
      }
      this.$emit('on-change');
    },
    drop({targetType, order, value}) {
      this.$store.commit(Types.ACCPET_VALUE, {
        targetType,
        order,
        value
      });
    },
    onValueOptionChange({menu, value}) {
      const changeVal = value.options[menu.target] !== menu.val ? menu.val : '';

      if (menu.target === 'valueType' && !changeVal) {
        return;
      }
      this.$store.commit(Types.CHANGE_VALUE_OPTION, {value, target: menu.target, val: changeVal});
      this.$emit('on-change');
    },
    allowFilter({value}) {
      if (value.type === 'M') {
        return true;
      }
    }
  },
};
</script>

<style lang="scss">
.value-card {
  .block {
    display: block;
    width: auto;
    height: 25px;
    line-height: 25px;
    padding-left: 10px;
    padding-right: 10px;
  }
}
</style>
