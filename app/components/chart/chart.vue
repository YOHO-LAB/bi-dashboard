<template>
    <div class="result-chart">
        <e-charts ref="eCharts" v-show="!noSupport" class="bi-chart" :options="currentOption" :auto-resize="true"></e-charts>
        <div class="no-support" v-show="noSupport">
            {{noSupportTip}}
        </div>
    </div>
</template>

<script>
import _ from 'lodash';
import ECharts from 'vue-echarts/components/ECharts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/tree';
import 'echarts/lib/chart/treemap';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/sunburst';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/visualMap';
import 'echarts/lib/component/title';
import 'echarts/lib/component/toolbox';
import 'echarts/lib/component/legendScroll';

export default {
  name: 'Chart',
  props: {
    options: {
      type: Object,
      default() {
        return {};
      }
    },
    noSupport: Boolean,
    noSupportTip: String
  },
  watch: {
    options(val) {
      Object.assign(this.currentOption, val);
    }
  },
  created() {
    if (!_.isEmpty(this.options)) {
      Object.assign(this.currentOption, this.options);
    }
  },
  methods: {
    capture() {
      let chart = this.$refs.eCharts.chart;

      return chart.getDataURL();
    }
  },
  data() {
    return {
      currentOption: {
        title: {
          text: ''
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          containLabel: true
        },
        legend: {
          data: []
        },
        series: []
      }
    };
  },
  components: {ECharts}
};
</script>

<style lang="scss">
.result-chart {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  .no-support {
    font-size: 16px;
    color: #999;
  }
}
</style>
