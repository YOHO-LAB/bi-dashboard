<template>
    <i-card class="layout-content-card">
        <slot name="title" slot="title"></slot>
        <slot name="extra" slot="extra"></slot>
        <slot></slot>
    </i-card>
</template>

<script>
export default {
  name: 'LayoutContentCard'
};
</script>

<style lang="scss">
.layout-content-card {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;

  & > .ivu-card-body {
    overflow-y: auto;
    height: initial;
  }
}
</style>
