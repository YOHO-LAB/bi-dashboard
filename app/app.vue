<template>
    <router-view></router-view>
</template>

<script>
export default {
  name: 'App'
};
</script>

<style lang="scss">
.CodeMirror-hints { /* stylelint-disable-line */
  z-index: 1001 !important;
}

.ivu-card {
  .ivu-card-head {
    padding: 8px 10px;
  }

  &.flex-card {
    display: flex;
    flex-direction: column;

    .ivu-card-body {
      overflow: hidden;
      flex: 1;
    }
  }

  .ivu-card-extra {
    top: 10px;
  }
}

.pager:not(.ivu-page-simple) {
  text-align: right;
  margin-top: 20px;
}

.full-page {
  height: 100%;
}

.bi-chart {
  width: 100% !important;
  height: 100% !important;
}
</style>
