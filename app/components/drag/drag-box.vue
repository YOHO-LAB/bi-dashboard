<template>
    <div class="drag-box"
        :class="dragBoxClass"
        @mouseup.stop.prevent="onMouseUp">
        <slot></slot>
    </div>
</template>

<script>
import _ from 'lodash';
import drag from './drag';
import {mapState} from 'vuex';

export default {
  name: 'DragBox',
  computed: {
    ...mapState(['bi']),
    dragBoxClass() {
      return {
        'drag-allow': this.dragAllow,
        'drag-inline': this.inline
      };
    }
  },
  provide() {
    return {
      id: this.id,
      allow: this.allow,
      allowFilter: this.allowFilter
    };
  },
  data() {
    return {
      dragAllow: false
    };
  },
  created() {
    if (this.id) {
      drag.$on(`drag-hover-${this.id}`, this.dragHover.bind(this));
      drag.$on(`drag-up-${this.id}`, this.dragUp.bind(this));
      drag.$on('drag-start', this.startDrag.bind(this));
      drag.$on('drag-stop', this.stopDrag.bind(this));
    }
  },
  props: {
    id: String,
    inline: Boolean,
    allow: Array,
    allowFilter: Function
  },
  methods: {
    onMouseUp() {
      const {status} = drag;

      if (status === 'draging') {
        drag.$emit('drag-up', {id: this.id});
      }
    },
    dragUp({fromId, toId, fromValue, toValue, copy}) {
      if (!toId) {
        this.$emit('drag-up', {fromId, fromValue});
      } else {
        this.$emit('drag-up', {fromId, toId, fromValue, toValue, copy});
      }
    },
    dragHover(payload) {
      this.$emit('drag-hover', payload);
    },
    checkAllow({id, value}) {
      if (this.allow) {
        return _.some(this.allow, a => a === id);
      } else if (this.allowFilter) {
        return this.allowFilter({id, value});
      }
      return true;
    },
    startDrag({id, value}) {
      this.dragAllow = this.checkAllow({id, value});
    },
    stopDrag() {
      this.dragAllow = false;
    }
  }
};
</script>

<style lang="scss">
.drag-box {
  height: 100%;
  width: 100%;
  overflow-y: auto;
  border: solid 1px #fff;

  &.drag-allow {
    border: solid 1px #f7b7b7;
  }

  &.drag-inline {
    overflow: initial;

    .drag-box-item {
      display: inline-block;
    }

    .will-draged,
    .drag-box-item-slot {
      float: left;
    }
  }

  .group-name {
    font-size: 13px;
    line-height: 20px;
    margin-bottom: 5px;
    color: #999;
  }
}
</style>
