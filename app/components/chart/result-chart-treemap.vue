<template>
    <bi-chart ref="biChart"
        :options="chartOption"
        :no-support="noSupport"
        :no-support-tip="noSupportTip"
        :auto-resize="true"></bi-chart>
</template>

<script>
import _ from 'lodash';
import {convertColumnToData} from './chart-util';

export default {
  name: 'ResultChartTreemap',
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
      noSupportTip: '数据不支持该图表展示，请尝试1个或多个维度列和1个度量值'
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
      if (columnEnums.length < 1 || values.length !== 1 || rowsData.length !== 1) {
        this.noSupport = true;
        return;
      }
      const chartOptions = {
        tooltip: {
          trigger: 'item',
        },
      };

      chartOptions.series = {
        name: 'ALL',
        type: 'treemap',
        left: 'center',
        label: {
          show: true,
          formatter: '{b}'
        },
        upperLabel: {
          normal: {
            show: true,
            height: 30
          }
        },
        levels: [
          {
            itemStyle: {
              normal: {
                borderColor: '#777',
                borderWidth: 0,
                gapWidth: 1
              }
            },
            upperLabel: {
              normal: {
                show: false
              }
            }
          },
          {
            itemStyle: {
              normal: {
                borderColor: '#555',
                borderWidth: 5,
                gapWidth: 1
              },
              emphasis: {
                borderColor: '#ddd'
              }
            }
          },
          {
            colorSaturation: [0.35, 0.5],
            itemStyle: {
              normal: {
                borderWidth: 5,
                gapWidth: 1,
                borderColorSaturation: 0.6
              }
            }
          }
        ],
        data: convertColumnToData(rowsData[0], values[0], columnEnums.length)
      };

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
