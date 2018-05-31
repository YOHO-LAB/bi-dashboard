<template>
    <bi-chart ref="biChart"
        :options="chartOption"
        :no-support="noSupport"
        :no-support-tip="noSupportTip"
        :auto-resize="true"></bi-chart>
</template>

<script>
import _ from 'lodash';
export default {
  name: 'ResultChartLine',
  props: {
    worksheet: {
      type: Object,
      default() {
        return {};
      }
    },
    viewData: {
      type: Object,
      default() {
        return {};
      }
    },
  },
  data() {
    return {
      chartOption: {},
      noSupport: false,
      noSupportTip: '数据不支持该图表展示，请尝试1个维度列和1个或多个度量值'
    };
  },
  created() {
    if (!_.isEmpty(this.viewData)) {
      this.renderChart(this.viewData);
    }
  },
  watch: {
    ['viewData'](viewData) {
      if (!_.isEmpty(viewData)) {
        this.renderChart(viewData);
      }
    }
  },
  methods: {
    capture() {
      return this.$refs.biChart.capture();
    },
    renderChart(viewData) {
      const {values} = this.worksheet;
      const {columnEnums, rowsData} = viewData;

      this.noSupport = false;
      if (columnEnums.length !== 1 || values.length === 0) {
        this.noSupport = true;
        return;
      }
      const columns = columnEnums[0];
      const chartOptions = {
        xAxis: {},
        yAxis: {},
        legend: {},
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
      };

      chartOptions.xAxis.data = _.filter(columns, c => c);
      chartOptions.legend.data = _.map(values, v => v.alias || v.title);
      chartOptions.series = _.map(values, v => {
        return {
          name: v.alias || v.title,
          type: 'line',
          data: _.map(columns, col => {
            const row = _.find(rowsData, r => r[col]);

            return row ? row[col][v.title] : 0;
          })
        };
      });
      this.chartOption = chartOptions;
    }
  },
};
</script>

<style lang="scss">
.bi-chart {
  width: 100% !important;
  height: 100% !important;
}
</style>
