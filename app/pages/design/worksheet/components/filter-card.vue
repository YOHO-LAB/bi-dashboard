<template>
    <i-card class="filter-card flex-card">
        <p slot="title">筛选器</p>
        <drag-box
            id="filter"
            :allow-filter="allowFilter"
            @drag-up="onDropUp">
            <drag-box-item
                v-for="value in worksheet.filters"
                :value="value"
                :key="value.title">
                <drag-drop-down-box
                    class="drop-light"
                    :value="value"
                    :menu="GETTER_FILTER_MENU(value)"
                    @on-filter-type="onFilterType"
                    @on-remove="removeValue"></drag-drop-down-box>
            </drag-box-item>
        </drag-box>
    </i-card>
</template>

<script>
import {mapState, mapGetters} from 'vuex';
import * as Types from 'store/worksheet/types';

export default {
  name: 'FilterCard',
  data() {
    return {
      dataType: 'FILTER'
    };
  },
  computed: {
    ...mapState(['worksheet']),
    ...mapGetters([Types.GETTER_FILTER_MENU])
  },
  methods: {
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
    onDropUp(payload) {
      this.$store.commit(Types.DRAG_VALUE_ACCPET, payload);
      this.$emit('on-change');
    },
    drop({targetType, order, value}) {
      this.$store.commit(Types.ACCPET_VALUE, {
        targetType,
        order,
        value
      });
    },
    allowFilter({value}) {
      return !value.categorys;
    },
    onFilterType({menu, value}) {
      let changeVal;

      if (value.options[menu.target] === menu.val) {
        changeVal = value.type === 'D' ? 'Dropdown' : 'Limit';
      } else {
        changeVal = menu.val;
      }
      this.$store.commit(Types.CHANGE_VALUE_OPTION, {value, target: menu.target, val: changeVal});
      this.$store.dispatch(Types.FILTER_CHANGE, {value, val: ''});
    }
  },
};
</script>

<style lang="scss">
.filter-card {
  .drag-box {
    min-height: 100px;
  }
}
</style>
