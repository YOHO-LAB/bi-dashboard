<template>
    <div
        class="drag-box-item"
        :class="dragBoxItemClass"
        @mousedown.stop.prevent="willDrag"
        @mouseover.stop.prevent="startDragOver"
        @mouseleave.stop.prevent="stopDragOver"
        @mouseup.stop.prevent="dragUp">
        <div class="drag-box-item-slot" ref="slot">
            <slot></slot>
        </div>
        <div class="will-draged" :style="willDragStyle" v-if="dragingOver"></div>
    </div>
</template>

<script>
import _ from 'lodash';
import drag from './drag';
import {getSetCss} from './utils';
import {mapState} from 'vuex';

export default {
  name: 'DragBoxItem',
  inject: ['id', 'allow', 'allowFilter'],
  props: {
    copy: Boolean,
    hover: Boolean,
    value: Object,
  },
  data() {
    return {
      dragingHover: false,
      dragingOver: false,
      width: 0,
      height: 0
    };
  },
  computed: {
    ...mapState(['bi']),
    dragBoxItemClass() {
      return {
        'draing-over': this.dragingOver,
        'draing-hover': this.dragingHover,
      };
    },
    willDragStyle() {
      return {
        width: this.width,
        height: this.height
      };
    }
  },
  created() {
    drag.$on('drag-stop', this.stopDragOver.bind(this));
  },
  mounted() {
    this.width = getSetCss(this.$el, 'width');
    this.height = getSetCss(this.$el, 'height');
  },
  methods: {
    willDrag() {
      drag.$emit('will-drag', {id: this.id, value: this.value, el: this.$refs.slot, copy: this.copy});
    },
    startDragOver() {
      const {status, dragValue, dragId} = drag;


      if (status === 'draging' && dragValue !== this.value) {
        const allow = this.checkAllow({id: dragId, value: dragValue});

        if (allow) {
          this.dragingOver = true;
        }
        if (this.hover) {
          this.startTickTime();
        }
      }
    },
    dragUp() {
      const {status, dragValue, dragId} = drag;

      if (status === 'draging' && this.value !== dragValue) {
        const allow = this.checkAllow({id: dragId, value: dragValue});

        if (this.dragingHover) {
          if (this.id === dragId) {
            drag.$emit('drag-hover', {value: this.value});
          }
        } else if (allow) {
          drag.$emit('drag-up', {id: this.id, value: this.value});
        } else {
          drag.$emit('drag-up');
        }
      } else if (status) {
        drag.$emit('drag-up');
      }
      this.stopDragOver();
    },
    stopDragOver() {
      this.dragingOver = false;
      this.dragingHover = false;
      this.endTickTime();
    },
    checkAllow({id, value}) {
      if (this.allow) {
        return _.some(this.allow, a => a === id);
      } else if (this.allowFilter) {
        return this.allowFilter({id, value});
      }
      return true;
    },
    startTickTime() {
      this.endTickTime();
      this.tickTime = Date.now();
      this.tick = setInterval(() => {
        if (Date.now() - this.tickTime > 1000) {
          this.dragingHover = true;
        }
      }, 100);
    },
    endTickTime() {
      if (this.tick) {
        clearInterval(this.tick);
      }
    }
  }
};
</script>

<style lang="scss">
.drag-box-item {
  cursor: pointer;

  .will-draged {
    border: dotted 1px #ececec;
  }

  &.draing-hover {
    .drop-down-box {
      border: solid 1px #000;
    }
  }
}
</style>
