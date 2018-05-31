<template>
    <div class="field-icon-box">
        <i-icon v-if="showType === 'category'"
            :type="value.active ? 'chevron-down' : 'chevron-right'"
            class="field-icon category"
            @click.native.stop="onActiveCategory(value)"></i-icon>
        <span class="field-icon calc" v-if="showType === 'calc'"><i>=</i>#</span>
        <span class="field-icon dimension" v-if="showType === 'dimension'">Abc</span>
        <span class="field-icon measure" v-if="showType === 'measure'">#</span>
    </div>
</template>
<script>
export default {
  name: 'FieldIcon',
  props: {
    value: Object
  },
  computed: {
    showType() {
      if (this.value.categorys) {
        return 'category';
      } else if (this.value.calc) {
        return 'calc';
      } else if (this.value.type === 'D') {
        return 'dimension';
      } else if (this.value.type === 'M') {
        return 'measure';
      }
    }
  },
  methods: {
    onActiveCategory(val) {
      this.$emit('on-active-category', val);
    }
  }
};
</script>

<style lang="scss">
.field-icon-box {
  display: inline-block;
  text-align: center;
  width: 18px;

  .field-icon {
    line-height: 12px;
    font-size: 12px;
    color: #999;
    cursor: pointer;

    &.category {
      top: 5px;
    }

    &.calc {
      position: relative;
      color: #00b180;
      font-size: 14px;
      padding-left: 0;
      padding-right: 0;

      i {
        display: inline-block;
        font-size: 12px;
        vertical-align: top;
        padding-top: 3px;
      }
    }

    &.measure {
      color: #00b180;
      font-size: 16px;
    }

    &.dimension {
      display: inline-block;
      color: #4996b2;
      transform: scale(0.8);
    }
  }
}
</style>
