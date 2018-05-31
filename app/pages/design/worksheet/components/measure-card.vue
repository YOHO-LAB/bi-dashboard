<template>
    <i-card class="source-card measure-card flex-card">
        <p slot="title">度量</p>
        <drag-box
            id="measure"
            :animation="false"
            :allow="['dimension', 'measure']"
            @drag-up="onDropUp">
            <drag-box-item
                v-for="value in worksheet.measures"
                :copy="true"
                :value="value"
                :key="value.title">
                <div class="field-item measure-item">
                    <div class="group-name" v-if="value.showTableName">{{value.tableName}}</div>
                    <field-icon :value="value"></field-icon>
                    <drag-drop-down-box
                        :value="value"
                        :menu="GETTER_MEASURE_MENU(value)"
                        @on-remove="removeValue"
                        @on-rename="rename"
                        @on-edit-calc="editCalc">
                        {{value.alias || value.title}}
                    </drag-drop-down-box>
                </div>
            </drag-box-item>
        </drag-box>
        <modal-rename ref="renameEdit" @edited="renamed"></modal-rename>
        <modal-calc-field ref="calcField"></modal-calc-field>
    </i-card>
</template>

<script>
import {mapState, mapGetters} from 'vuex';
import * as Types from 'store/worksheet/types';
import FieldIcon from './field-icon';
import ModalRename from 'components/modal/modal-rename';
import ModalCalcField from './modal-calc-field';

export default {
  name: 'MeasureCard',
  computed: {
    ...mapState(['worksheet']),
    ...mapGetters([Types.GETTER_MEASURE_MENU])
  },
  methods: {
    onDropUp(payload) {
      if (!payload.toId) {
        return;
      }
      if (payload.fromId === 'dimension' || payload.fromId === 'measure') {
        payload.copy = false;
      }
      this.$store.commit(Types.DRAG_VALUE_ACCPET, payload);
    },
    dragEnd({targetType, fromType, remove, value}) {
      if (targetType) {
        if (remove && targetType === 'DIMENSION') {
          this.$store.commit(Types.REMOVE_VALUE, {fromType, value});
        }
        if (targetType !== 'DIMENSION') {
          this.$emit('on-change');
        }
      }
    },
    rename({value}) {
      this.editValue = value;
      this.$refs.renameEdit.show(value);
    },
    renamed({name}) {
      this.$store.commit(Types.RENAME_VALUE, {name, title: this.editValue.title});
    },
    editCalc({value}) {
      this.$refs.calcField.show(value);
    },
    removeValue({value}) {
      this.$store.commit(Types.REMOVE_VALUE, {
        fromType: 'MEASURE',
        value
      });
      this.$emit('on-change');
    },
  },
  components: {ModalRename, ModalCalcField, FieldIcon}
};
</script>

<style lang="scss">

</style>
