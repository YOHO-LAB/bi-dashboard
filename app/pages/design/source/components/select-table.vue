<template>
    <div class="checkbox-table">
        <drag-box id="table" :allow="[]">
            <drag-box-item v-for="t in tables" :key="t.tableName" :value="{schemeId, tableName: t.tableName}">
                <div class="table-item">{{t.tableName}}</div>
            </drag-box-item>
        </drag-box>
    </div>
</template>
<script>
import * as Types from 'store/database/types';

export default {
  name: 'SelectTable',
  props: {
    schemeId: Number
  },
  data() {
    return {
      tables: []
    };
  },
  watch: {
    schemeId(val) {
      this.loadData(val);
    }
  },
  created() {
    if (this.schemeId) {
      this.loadData(this.schemeId);
    }
  },
  methods: {
    async loadData(schemeId) {
      const result = await this.$store.dispatch(Types.FETCH_TABLES_REQUEST, {schemeId});

      if (result && result.code === 200) {
        this.tables = result.data;
      }
    }
  }
};
</script>

<style lang="scss">
.checkbox-table {
  margin-top: 10px;

  .chk-table {
    display: block;
  }

  .table-item {
    line-height: 25px;
    padding-left: 10px;
    padding-right: 10px;
    transition: background 0.2s ease-in-out;

    &:hover {
      background: #f3f3f3;
    }
  }
}
</style>
