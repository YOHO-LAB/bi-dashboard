<template>
    <div class="filter-box-limit">
        <p class="title">{{value.alias || value.title}}</p>
        <p class="limit">
            <span class="min">{{min}}</span>
            <span class="max" v-if="min !== max">{{max}}</span>
        </p>
        <slider v-model="ranges" :min="min" :max="max" range v-if="min !== max && reload" @on-change="change"></slider>
    </div>
</template>

<script>
import _ from 'lodash';
import {DebounceUtil} from 'utils';

export default {
  name: 'FilterBoxLimit',
  props: {
    value: Object,
    list: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      ranges: [0, 0],
      min: 0,
      max: 0,
      reload: true
    };
  },
  created() {
    this.renderData();
    this.debounceValueChange = DebounceUtil.debounce(500, this.change);
  },
  methods: {
    renderData() {

      if (this.list) {
        this.reload = false;

        this.$nextTick(() => {
          const min = _.ceil(this.list.min);
          const max = _.ceil(this.list.max);

          if (this.value.val &&
                        (this.value.val[0] !== this.ranges[0] || this.value.val[1] !== this.ranges[1])) {
            this.ranges = [this.value.val[0], this.value.val[1]];
          } else if (this.ranges[0] === this.ranges[1] && this.ranges[1] === 0) {
            this.ranges = [min, max];
          }
          if (this.ranges[0] < min || this.ranges[0] > max) {
            this.ranges[0] = min;
          }
          if (this.ranges[1] > max || this.ranges[1] < min) {
            this.ranges[1] = max;
          }
          this.min = min;
          this.max = max;
          this.reload = true;
        });
      }
    },
    change(val) {
      this.$emit('on-change', {value: this.value, val});
    }
  },
  watch: {
    ['list']() {
      this.renderData();
    },
    ranges(val, oldVal) {
      if (!oldVal[0] && !oldVal[1]) {
        return;
      }
      this.debounceValueChange(val);
    }
  }
};
</script>

<style lang="scss">
.filter-box-limit {
  .ivu-slider {
    padding-left: 9px;
    padding-right: 9px;

    .ivu-slider-wrap {
      margin: 5px 0;
    }
  }

  .limit {
    font-size: 12px;
    display: flex;
    width: 100%;

    .min,
    .max {
      flex: 1;
      color: #909399;
      font-style: italic;
      transform: scale(0.8);
    }

    .min {
      text-align: left;
      transform-origin: left;
    }

    .max {
      text-align: right;
      transform-origin: right;
    }
  }
}
</style>
