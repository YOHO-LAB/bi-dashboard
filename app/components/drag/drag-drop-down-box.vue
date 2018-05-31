<template>
    <i-dropdown
        class="drop-down-box"
        trigger="custom"
        :placement="placement"
        :class="dropItemClass"
        :visible="visible"
        @click.native="clickMenu"
        @on-click="chooseMenu"
        @on-clickoutside="clickoutside">
        <span v-if="!$slots.default">
            {{value.alias || value.title}}
            <i-icon class="arrow-down" type="arrow-down-b"></i-icon>
        </span>
        <span v-else>
            <slot></slot>
            <i-icon class="arrow-down" type="arrow-down-b"></i-icon>
        </span>
        
        <i-dropdown-menu class="drop-down-box-child" ref="dropdown" slot="list" v-if="menu.menus && menu.menus.length && childVisible">
            <template v-for="(childMenu, index) in menu.menus">
                <i-dropdown-item
                    v-if="!childMenu.menus"
                    :key="index"
                    :name="childMenu.title"
                    :divided="childMenu.divided">
                    <i-icon class="drap-icon" type="checkmark-round" v-if="selected(childMenu)"></i-icon>
                    <span class="drap-title">{{childMenu.title}}</span>
                </i-dropdown-item>
                <drag-drop-down
                    v-else
                    :key="index"
                    :path="childMenu.title"
                    :value="value"
                    :menu="childMenu">
                </drag-drop-down> 
            </template>
        </i-dropdown-menu>
    </i-dropdown>
</template>

<script>
import {mapState} from 'vuex';
import _ from 'lodash';
import DragDropDown from './drag-drop-down';

export default {
  name: 'DragDropDownBox',
  props: {
    value: Object,
    menu: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      visible: false,
      childVisible: false,
      placement: 'bottom-start',
    };
  },
  computed: {
    ...mapState(['worksheet']),
    dropItemClass() {
      let className = 'drag-dimension';

      if (this.value.type === 'M') {
        className = 'drag-measure';
      }

      return {
        [className]: true
      };
    }
  },
  methods: {
    selected(menu) {
      return menu.val && this.value.options[menu.target] === menu.val;
    },
    clickMenu(e) {
      if (this.$refs.dropdown && this.$refs.dropdown.$el.contains(e.target)) {
        return;
      }
      if (this.visible) {
        this.clickoutside();
        return;
      }
      const menuLength = this.menu.menus && this.menu.menus.length || 0;
      const {bottom} = this.$el.getBoundingClientRect();
      const height = window.innerHeight - bottom;

      if (height > (menuLength * 31 + 50)) {
        this.placement = 'bottom-start';
      } else {
        this.placement = 'top-start';
      }
      if (this.closeTimeout) {
        clearTimeout(this.closeTimeout);
      }
      this.visible = true;
      this.childVisible = true;
    },
    chooseMenu(name) {
      if (!name) {
        return;
      }
      let parent, menu;
      const sps = _.split(name, '.');

      if (sps.length > 1) {
        menu = this.menu;

        _.each(sps, (n, index) => {
          menu = _.find(menu.menus, m => m.title === n);
          if (index === sps.length - 2) {
            parent = menu;
          }
        });
      } else {
        parent = this.menu;
        menu = _.find(parent.menus, m => m.title === name);
      }
      this.clickoutside();
      this.$emit(`on-${_.kebabCase(menu.target)}`, {menu, parent, value: this.value});
    },
    clickoutside() {
      if (this.closeTimeout) {
        clearTimeout(this.closeTimeout);
      }
      this.visible = false;
      this.closeTimeout = setTimeout(() => {
        this.childVisible = false;
      }, 500);
    }
  },
  components: {DragDropDown}
};
</script>

<style lang="scss">
.drop-item.dragenter {
  .drop-down-box {
    border: solid 1px #999;
  }
}

.drop-item.nodrop {
  .drop-down-box {
    border: solid 1px #fff !important;
  }
}

.drop-down-box {
  padding-left: 10px;
  padding-right: 10px;
  font-size: 13px;
  line-height: 20px;
  border: solid 1px #fff;
  border-radius: 25px;

  .drop-down-box-child {
    width: 120px;
  }

  .arrow-down {
    opacity: 0;
  }

  .drap-title {
    padding-left: 3px;
  }

  .drap-icon {
    width: 10px;
    overflow: hidden;
    margin-left: -10px;
    float: left;
    vertical-align: middle;
    line-height: 17px;
  }

  &.drop-light {
    &.drag-dimension {
      background: #4996b2;
      color: #fff;
    }

    &.drag-measure {
      background: #00b180;
      color: #fff;
    }
  }

  &:hover {
    color: #fff;

    .field-icon {
      color: #fff !important;
    }

    .arrow-down {
      opacity: 1;
    }

    &.drag-dimension {
      background: rgba(73, 150, 178, 0.77);
    }

    &.drag-measure {
      background: rgba(0, 177, 128, 0.77);
    }
  }
}
</style>
