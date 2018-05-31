<template>
    <div class="card-data" :style="{['border-style']: borderStyle}" :class="{shadow}">
        <div class="card-data-content">
            <div class="card-data-extra">
                <slot name="extra"></slot>
            </div>
            <div class="card-data-title">
                <slot name="title"></slot>
            </div>
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
  name: 'CardData',
  props: {
    borderStyle: {
      type: String,
      default: 'solid'
    },
    shadow: {
      type: Boolean,
      default: true
    }
  }
};
</script>

<style lang="scss">
$border-color: #e9eaec;

@mixin card-data-border {
  border-width: 1px;
  border-color: $border-color;
  border-style: inherit;
}

.card-data {
  float: left;
  position: relative;
  z-index: 4;
  background-color: #fff;
  width: 300px;
  height: 200px;
  margin-left: 15px;
  margin-right: 15px;
  margin-bottom: 30px;
  border-width: 0;
  cursor: pointer;

  &:hover {
    &.shadow {
      .card-data-content,
      &:before,
      &:after {
        transition: box-shadow 0.2s ease-in-out;
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
      }
    }

    &:not(.shadow) {
      .card-data-content,
      &:before,
      &:after {
        border-color: #bbbbbd;
      }
    }

    .card-data-extra {
      display: initial;
    }
  }

  .card-data-content {
    @include card-data-border;

    width: 100%;
    height: 100%;
    position: relative;
    z-index: 3;
    background-color: #fff;
    padding: 16px;
    border-radius: 4px;

    .card-data-title {
      font-size: 13px;
      font-weight: bold;
      line-height: 30px;
    }
  }

  .card-data-extra {
    display: none;
    position: absolute;
    right: 16px;
    top: 14px;

    .ivu-icon {
      cursor: pointer;
      margin-left: 5px;
      color: #80848f;

      &:hover {
        color: #000;
      }
    }
  }

  &:before {
    @include card-data-border;

    z-index: 2;
    content: "";
    position: absolute;
    top: 5px;
    left: 5px;
    width: 100%;
    height: 100%;
    background-color: #fff;
    border-radius: 4px;
  }

  &:after {
    @include card-data-border;

    z-index: 1;
    content: "";
    position: absolute;
    top: 10px;
    left: 10px;
    width: 100%;
    height: 100%;
    background-color: #fff;
    border-radius: 4px;
  }
}
</style>
