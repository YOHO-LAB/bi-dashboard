<template>
    <i-dropdown trigger="hover" placement="right-start">
        <i-dropdown-item>
            <span class="drap-title">
                {{menu.title}}
            </span>
            <i-icon type="ios-arrow-right"></i-icon>
        </i-dropdown-item>
        <i-dropdown-menu slot="list">
            <template v-for="(childMenu, index) in menu.menus">
                <i-dropdown-item
                    v-if="!childMenu.menus"
                    :key="index"
                    :name="`${path}.${childMenu.title}`"
                    :divided="childMenu.divided">
                    <i-icon class="drap-icon" type="checkmark-round" v-if="selected(childMenu)"></i-icon>
                    <span class="drap-title">{{childMenu.title}}</span>
                </i-dropdown-item>
                <drag-drop-down
                    v-else
                    :key="index"
                    :path="`${path}.${childMenu.title}`"
                    :menu="childMenu">
                </drag-drop-down>
            </template>
        </i-dropdown-menu>
    </i-dropdown>
</template>

<script>

export default {
  name: 'DragDropDown',
  props: {
    value: Object,
    menu: {
      type: Object,
      default() {
        return {};
      }
    },
    path: String
  },
  methods: {
    selected(menu) {
      return menu.val && this.value.options[menu.target] === menu.val;
    },
  }
};
</script>
