<template>
    <i-card class="layout-multi-tab-card">
        <div class="extra">
            <slot name="extra"></slot>
        </div>
        <slot></slot>
    </i-card>
</template>

<script>
export default {
  name: 'LayoutMultiTabCard'
};
</script>

<style lang="scss">
.layout-multi-tab-card {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;

  & > .ivu-card-body {
    overflow-y: auto;
  }

  .extra {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 2;
  }
}
</style>
