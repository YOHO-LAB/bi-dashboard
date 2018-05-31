<template>
    <bi-table
        :columns="columnsData"
        :rows="rowsData"
        :sort="worksheet.orders"
        @sort-change="onSortChange"></bi-table>
</template>

<script>
import _ from 'lodash';
import BiTable from '../table/bi-table';
import {Canvas2ImageUtil} from 'utils';

const existsColumns = (colpath, rowsData) => {
  return _.some(rowsData, rows => _.has(rows, _.join(colpath, '.')));
};

const getColumns = (columnsData, rowsData, values, columnLevel = 0, colpath = []) => {
  const columns = [];

  if (!columnsData[columnLevel]) {
    return _.map(values, v => {
      return {
        label: v.alias || v.title,
        prop: v.title,
        format: _.get(v, 'options.formatType', ''),
        width: 150
      };
    });
  } else {
    _.each(columnsData[columnLevel], col => {
      const childColpath = [].concat(colpath, [col]);

      if (!existsColumns(childColpath, rowsData)) {
        return;
      }
      columns.push({
        label: col,
        prop: col,
        childrens: getColumns(columnsData, rowsData, values, columnLevel + 1, childColpath)
      });
    });
  }
  return columns;
};

export default {
  name: 'ResultTable',
  props: {
    viewData: {
      type: Object,
      default() {
        return {};
      }
    },
    worksheet: Object,
  },
  data() {
    return {
      columnsData: [],
      rowsData: [],
    };
  },
  created() {
    this.renderData(this.viewData);
  },
  watch: {
    ['viewData'](data) {
      this.renderData(data);
    },
  },
  methods: {
    async capture() {
      return await Canvas2ImageUtil.capture(this.$el.querySelector('.bi-table-content'));
    },
    renderData({rowsData, columnEnums}) {
      let columnsData = [];
      const {rows, values} = this.worksheet;

      if (rowsData && columnEnums) {
        columnsData = _.map(rows, r => {
          if (r.categorys) {
            r = r.categorys[r.level];
          }
          return {
            label: r.alias || r.title,
            prop: r.title,
            width: 170
          };
        }).concat(getColumns(columnEnums, rowsData, values));
        this.columnsData = columnsData;
        this.rowsData = rowsData;
      } else {
        this.columnsData = [];
        this.rowsData = [];
      }
    },
    onSortChange(payload) {
      this.$emit('sort-change', payload);
    }
  },
  components: {BiTable}
};
</script>

<style>

</style>
