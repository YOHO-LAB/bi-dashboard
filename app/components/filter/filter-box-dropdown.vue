<template>
    <div class="filter-box-dropdown">
        <p class="title">{{value.alias || value.title}}</p>
        <i-select size="small" filterable :value="value.val" clearable @on-change="change">
            <i-option v-for="item in currentList" :value="item || ''" :key="item">{{ item }}</i-option>
        </i-select>
    </div>
</template>

<script>
export default {
  name: 'FilterBoxDropdown',
  data() {
    return {
      currentList: []
    };
  },
  props: {
    value: Object,
    list: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  watch: {
    list(val) {
      if (val) {
        this.currentList = val;
      }
    }
  },
  created() {
    if (this.list) {
      this.currentList = this.list;
    }
  },
  methods: {
    change(val) {
      this.$emit('on-change', {value: this.value, val});
    }
  }
};
</script>

<style lang="scss">
.filter-box-dropdown {
  .ivu-select {
    margin-top: 5px;
  }
}
</style>
