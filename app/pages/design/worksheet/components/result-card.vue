<template>
    <card-dashboard
      ref="viewDashboardCard"
      class="results-card"
      :title="title"
      :view-type="currentWorksheet.worksheetResultType"
      :worksheet="currentWorksheet"
      :loading="worksheet.fetchDashboarding"
      @on-filter-change="onFilterChange"
      @on-sort-change="onSortChange">
    </card-dashboard>
</template>

<script>
import * as Types from 'store/worksheet/types';
import {mapState, mapGetters} from 'vuex';
import FilterBox from './filter-box';
import _ from 'lodash';

export default {
  name: 'ResultCard',
  computed: {
    ...mapState(['worksheet']),
    ...mapGetters(['GETTER_RESULT_TYPES']),
    currentWorksheet() {
      return {
        rows: this.worksheet.rows,
        values: this.worksheet.values,
        filters: this.worksheet.filters,
        orders: this.worksheet.orders,
        worksheetResultType: this.worksheet.worksheetResultType
      };
    },
    title() {
      return `数据结果[${_.find(this.GETTER_RESULT_TYPES, t => t.type === this.worksheet.worksheetResultType).label}]`;
    },
  },
  methods: {
    async capture() {
      return await this.$refs.viewDashboardCard.capture();
    },
    render(allViewData) {
      if (this.$refs.viewDashboardCard) {
        this.$refs.viewDashboardCard.render(allViewData);
      }
    },
    onFilterChange({value, val}) {
      this.$store.commit(Types.FILTER_CHANGE, {value, val});
      this.$emit('on-filter-change', {value, val});
    },
    onSortChange({column, order}) {
      this.$store.commit(Types.SORT_CHANGE, {column, order});
    }
  },
  components: {FilterBox}
};
</script>

<style lang="scss">
.results-card {
  .result-spin {
    position: absolute;
    z-index: 3;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
