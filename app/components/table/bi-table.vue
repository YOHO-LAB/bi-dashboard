<template>
    <div class="bi-table">
        <div class="bi-table-content" :style="{width: `${width}px`}">
            <bi-table-header
                ref="header"
                :columns-data="currentColumns"
                :build-columns="buildColumns"
                :width="width"
                @sort-change="sortChange">
                <slot name="header"></slot>
            </bi-table-header>
            <bi-table-body :columns-data="currentColumns" :rows="currentRows" :width="width"></bi-table-body>
        </div>
    </div>
</template>

<script>
import BiTableHeader from './bi-table-header';
import BiTableBody from './bi-table-body';
import {
  getDataByComponents,
  convertTableData,
  sortRowsData
} from './table-process';
import _ from 'lodash';


export default {
  name: 'BiTable',
  props: {
    columns: Array,
    rows: Array,
    sort: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      currentColumns: [],
      currentRows: [],
      buildColumns: [],
      columnsData: [],
      width: 0,
    };
  },
  created() {
    if (this.columns && this.rows) {
      this.renderData();
    }
  },
  watch: {
    columns() {
      this.renderData();
    },
    sort() {
      this.renderData();
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    renderData() {
      const data = this.columns ? this.columns : getDataByComponents(this.$slots.default);

      if (data) {
        const {buildColumns, columnsData} = convertTableData(data);

        if (this.sort.order) {
          _.each(buildColumns, rows => {
            _.each(rows, col => {
              if (col.value.prop === this.sort.column) {
                col.sort = this.sort.order;
              }
            });
          });
        }
        this.buildColumns = buildColumns;
        this.currentColumns = columnsData;
      }
      this.currentRows = this.sort.order ? sortRowsData(this.rows, this.sort) : this.rows;
      this.handleResize();
    },
    handleResize() {
      this.$nextTick(() => {
        let allWidth = _.sumBy(this.currentColumns, 'width');

        allWidth = _.max([allWidth, 0]);
        this.width = allWidth;
      });
    },
    sortChange(payload) {
      this.$emit('sort-change', payload);
    },
  },
  components: {BiTableHeader, BiTableBody}
};
</script>

<style lang="scss">
.bi-table {
  position: relative;
  overflow-x: auto;
  overflow-y: auto;
  height: 100%;

  .bi-table-body {
    overflow-y: auto;
    overflow-x: hidden;
    height: 100%;
    flex: 1;

    table {
      table-layout: fixed;
    }
  }

  .bi-table-header {
    border-top: 1px solid #ebeef5;

    table {
      table-layout: fixed;
    }
  }

  thead {
    color: #909399;
  }

  th {
    background: #f5f7fa;
    padding: 2px 0;
    font-size: 12px;
    text-align: left;
  }

  td {
    padding: 2px 0;

    &:first-child {
      border-left: 1px solid #ebeef5;
    }
  }

  td,
  th {
    &:first-child {
      border-left: 1px solid #ebeef5;
    }

    min-width: 0;
    box-sizing: border-box;
    text-overflow: ellipsis;
    vertical-align: middle;
    position: relative;
    border-right: 1px solid #ebeef5;
    border-bottom: 1px solid #ebeef5;
  }

  .cell {
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-all;
    line-height: 23px;
    padding-left: 10px;
    padding-right: 10px;
  }

  .gutter {
    border-width: 0;
  }

  .sort-icon {
    display: inline-block;
    width: 9px;
    height: 12px;
    margin-left: 4px;
    margin-top: -1px;
    vertical-align: middle;
    overflow: hidden;
    cursor: pointer;
    position: relative;

    i {
      display: block;
      height: 6px;
      line-height: 6px;
      overflow: hidden;
      position: absolute;
      color: #bbbec4;
      transition: color 0.2s ease-in-out;

      &.on {
        color: #2d8cf0;
      }

      &:first-child {
        top: 0;
      }

      &:last-child {
        bottom: 0;
      }
    }
  }
}
</style>
