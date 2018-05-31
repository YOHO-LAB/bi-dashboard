<template>
    <i-card class="source-card dimension-card flex-card">
        <p slot="title">维度</p>
        <p slot="extra">
            <i-dropdown class="measure-dropdown" trigger="click" @on-click="onDropdownClick">
                <i-icon type="arrow-down-b"></i-icon>
                <i-dropdown-menu slot="list">
                    <i-dropdown-item name="addCalc">添加计算字段</i-dropdown-item>
                </i-dropdown-menu>
            </i-dropdown>
        </p>
        <drag-box
            id="dimension"
            :animation="false"
            :allow="['measure', 'dimension']"
            @drag-up="onDropUp"
            @drag-hover="onDropHover">
            <div
                class="field-item dimension-item"
                :class="{category: value.categorys}"
                v-for="value in worksheet.dimensions"
                :key="value.title">
                <div class="group-name" v-if="value.showTableName">{{value.tableName}}</div>
                <drag-box-item
                    :hover="true"
                    :copy="true"
                    :value="value">
                    <field-icon :value="value" @on-active-category="onActiveCategory"></field-icon>
                    <drag-drop-down-box
                        :value="value"
                        :menu="GETTER_DIMENSITION_MENU(value)"
                        @on-remove="onRemoveValue"
                        @on-rename="onRename"
                        @on-edit-calc="onEditCalc">
                        {{value.alias || value.title}}
                    </drag-drop-down-box>
                    <transition-group tag="div" name="drag-box" class="categorys"
                        :class="{active: value.active}">
                        <drag-box-item
                            v-for="childValue in value.categorys"
                            :key="childValue.title"
                            :value="childValue"
                            class="no-order">
                            <field-icon :value="childValue" ></field-icon>
                            <drag-drop-down-box
                                :value="childValue"
                                :menu="GETTER_DIMENSITION_MENU(childValue)"
                                @on-remove="onRemoveValue"
                                @on-rename="onRename"
                                @on-edit-calc="onEditCalc"
                                @on-change-order="onChangeOrder">
                                {{childValue.alias || childValue.title}}
                            </drag-drop-down-box>
                        </drag-box-item>
                    </transition-group>
                </drag-box-item>
            </div>
        </drag-box>
        <modal-rename ref="renameEdit" @edited="onRenamed"></modal-rename>
        <modal-calc-field ref="calcField" @on-calc-add="onCalcAdd"></modal-calc-field>
        <modal-category ref="modalCategory" @on-save="onCategorySave"></modal-category>
    </i-card>
</template>

<script>
import {mapState, mapGetters} from 'vuex';
import * as Types from 'store/worksheet/types';
import ModalRename from 'components/modal/modal-rename';
import FieldIcon from './field-icon';
import ModalCalcField from './modal-calc-field';
import ModalCategory from './modal-category';

export default {
  name: 'DimensionCard',
  computed: {
    ...mapState(['worksheet']),
    ...mapGetters([Types.GETTER_DIMENSITION_MENU])
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
    onDropHover({id, toValue, fromValue}) {
      if (id === 'dimension') {
        this.$refs.modalCategory.show(`${toValue.alias || toValue.title}，${fromValue.alias || fromValue.title}`, {id, toValue, fromValue});
      }
    },
    onCategorySave({name, data: {id, fromValue, toValue}}) {
      this.$store.commit(Types.DRAG_VALUE_HOVER, {id, fromValue, toValue, name});
    },
    onRename({value}) {
      this.editValue = value;
      this.$refs.renameEdit.show(value);
    },
    onRenamed({name}) {
      this.$store.commit(Types.RENAME_VALUE, {name, title: this.editValue.title});
    },
    onEditCalc({value}) {
      this.$refs.calcField.show(value);
    },
    onDropdownClick(name) {
      if (name === 'addCalc') {
        this.drpDownAddCalc();
      }
    },
    drpDownAddCalc() {
      this.$refs.calcField.show();
    },
    onRemoveValue({value}) {
      this.$store.commit(Types.REMOVE_VALUE, {
        fromType: 'DIMENSION',
        value
      });
      this.$emit('on-change');
    },
    onCalcAdd({value}) {
      this.$store.commit(Types.ADD_CALC_FIELD, {value});
      this.$emit('on-change');
    },
    onDragItemDrop({value, secondValue}) {
      this.$refs.calcCategory.show(`${value.alias || value.title}，${secondValue.alias || secondValue.title}`, {value, secondValue});
    },
    onActiveCategory(value) {
      this.$store.commit(Types.TOGGLE_CATEGORY_ACTIVE, {value});
    },
    onChangeOrder({value, menu: {val}}) {
      this.$store.commit(Types.CHANGE_CATEGORY_ORDER, {value, type: val});
    }
  },
  components: {ModalRename, ModalCalcField, ModalCategory, FieldIcon}
};
</script>

<style lang="scss">
.dimension-item {
  .categorys {
    display: none;
    margin-left: 15px;
    overflow: hidden;
    height: 0;

    &.active {
      display: block;
      height: auto;
    }
  }
}
</style>
