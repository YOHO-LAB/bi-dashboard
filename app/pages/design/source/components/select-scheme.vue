<template>
    <div class="select-scheme">
        <i-select filterable placeholder='请选择Scheme' @on-change="onChange" v-model="currentScheme">
            <i-option v-for="scheme in schemes" :value="scheme.id" :key="scheme.id">{{`${scheme.name}[${scheme.dbName}]`}}</i-option>
        </i-select>
    </div>
</template>

<script>
import * as Types from 'store/database/types';

export default {
  name: 'SelectScheme',
  props: {
    databaseId: Number
  },
  data() {
    return {
      schemes: [],
      currentScheme: ''
    };
  },
  watch: {
    databaseId(val) {
      if (val) {
        this.loadData(val);
      }
    }
  },
  created() {
    if (this.databaseId) {
      this.loadData(this.databaseId);
    }
  },
  methods: {
    onChange(selectId) {
      this.$emit('input', selectId);
      this.$emit('on-change', selectId);
    },
    async loadData(databaseId) {
      const result = await this.$store.dispatch(Types.FETCH_SCHEMES_REQUEST, {databaseId});

      if (result && result.code === 200) {
        this.schemes = result.data;
      }
    }
  }
};
</script>

<style>

</style>
