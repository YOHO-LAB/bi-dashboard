<template>
    <div class="filter-box" v-if="filters.length">
        <transition name="filter-box" @beforeEnter="beforeEnter" @afterLeave="afterLeave">
            <div class="filter-box-container" v-show="visiable">
                <p class="title">筛选器</p>
                <div class="filter-box-list">
                    <component
                        v-for="(filter, index) in filters"
                        :key="index"
                        class="filter-item"
                        :is="`FilterBox${filter.options.filterType}`"
                        :value="filter"
                        :list="enums[filter.title]"
                        @on-change="filterChange">
                    </component>
                </div>
                <div class="arrow" @click="switchVisiable">
                    <span>筛选器</span>
                </div>
            </div>
        </transition>
        <div class="arrow right" @click="switchVisiable">
            <span>筛选器</span>
        </div>
    </div>
</template>

<script>
export default {
  name: 'FilterBox',
  props: {
    filters: {
      type: Array,
      default() {
        return [];
      }
    },
    enums: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      visiable: false,
      showLeft: true,
    };
  },
  methods: {
    switchVisiable() {
      this.visiable = !this.visiable;
    },
    beforeEnter() {
      this.showLeft = false;
    },
    afterLeave() {
      this.showLeft = true;
    },
    filterChange(payload) {
      this.$emit('on-change', payload);
    }
  },
};
</script>

<style lang="scss">
.filter-box {
  position: absolute;
  width: auto;
  right: 0;
  top: 0;
  height: 100%;

  .arrow {
    position: absolute;
    left: -15px;
    top: 50px;
    border-right: 15px solid #4996b2;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    height: 55px;
    width: 0;
    cursor: pointer;
    font-size: 12px;
    color: #fff;
    z-index: 2;

    &.right {
      position: absolute;
      left: inherit;
      right: 0;
      z-index: 2;
    }

    span {
      display: inline-block;
      transform: scale(0.8);
      transform-origin: top;
      line-height: 15px;
      text-align: center;
      margin-left: 1px;
      margin-top: 2px;
      font-style: italic;
    }

    .ivu-icon {
      color: #fff;
      font-size: 12px;
      margin-left: 2px;
    }
  }
}

.filter-box-container {
  position: relative;
  z-index: 3;
  height: 100%;
  width: 200px;
  background: rgba(255, 255, 255, 1);
  border: 1px solid #ebeef5;
  padding: 10px;

  .filter-box-list {
    position: relative;
    z-index: 3;
    width: 100%;
    height: 100%;
    overflow-y: auto;
  }

  > .title {
    font-weight: 700;
  }

  .filter-item {
    margin-top: 10px;

    .title {
      font-size: 12px;
      color: #909399;
      font-style: italic;
    }
  }
}

.filter-box-enter-active,
.filter-box-leave-active {
  will-change: transform;
  transition-duration: 200ms;
  transition-timing-function: ease-in-out;
}

.filter-box-enter,
.filter-box-leave-to {
  transform: translateX(200px);
}

.filter-box-enter-to,
.filter-box-leave {
  transform: translateX(0);
}
</style>
