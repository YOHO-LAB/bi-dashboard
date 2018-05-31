<template>
    <i-card class="card-dashboard flex-card">
        <p class="title" slot="title">{{title}}
            <span v-if="viewType === 'table'" class="count">
              -共计{{viewData.count}}条结果，每页{{size}}条
            </span>
        </p>
        <div class="extra" slot="extra">
            <i-page
                v-if="viewType === 'table'"
                class="pager"
                :total="viewData.count"
                :page-size="size"
                simple
                @on-change="onPageChange">
            </i-page>
            <slot name="extra"></slot>
        </div>
        <template v-if="!loading">
          <result-table
            ref="resultBox"
            v-if="viewType === 'table'"
            :view-data="viewData"
            :worksheet="worksheet"
            @sort-change="onSortChange">
          </result-table>
          <component v-else :is="resultType" ref="resultBox" :view-data="viewData" :worksheet="worksheet"></component>
        </template>
        <i-spin size="large" fix v-else></i-spin>
        <filter-box :filters="worksheet.filters" :enums="viewData.filterEnums" @on-change="onFilterChange"></filter-box>
    </i-card>
</template>

<script>
import {ArrayUtil} from 'utils';
import FilterBox from './filter-box';

export default {
  name: 'CardDashboard',
  props: {
    worksheet: Object,
    title: String,
    viewType: String,
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      viewData: {},
      page: 1,
      size: 50
    };
  },
  computed: {
    resultType() {
      return `result-${this.viewType}`;
    },
  },
  methods: {
    render(allViewData, page, order) {
      let rowsData;

      this.page = page || 1;
      if (this.viewType === 'table') {
        rowsData = ArrayUtil.sliceArrays(allViewData.rowsData, this.page, this.size, order);
      } else {
        rowsData = allViewData.rowsData;
      }
      this.viewData = {
        columnEnums: allViewData.columnEnums,
        filterEnums: allViewData.filterEnums,
        rowsData,
        count: allViewData.rowsData.length
      };
      this.allViewData = allViewData;
    },
    async capture() {
      return await this.$refs.resultBox.capture();
    },
    onSortChange(order) {
      this.render(this.allViewData, this.page, order);
      this.$emit('on-sort-change', order);
    },
    onPageChange(page) {
      this.render(this.allViewData, page);
    },
    onFilterChange(payload) {
      this.$emit('on-filter-change', payload);
    }
  },
  components: {FilterBox}
};
</script>

<style lang="scss">
.card-dashboard {
  position: relative;
  overflow: hidden;

  .title {
    .count {
      color: #495060;
      font-weight: normal;
      font-size: 13px;
    }
  }

  .extra {
    display: flex;
  }

  & > .ivu-card-extra {
    top: 0;
    display: flex;
    align-items: center;
    height: 39px;
    line-height: 30px;
  }
}
</style>
