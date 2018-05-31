<template>
    <div class="layout" :class="{'no-header': noHeader}">
        <div class="layout-header" v-if="!noHeader">
            <i-menu class="header-menu" mode="horizontal" theme="dark" active-name="1" @on-select="navigte">
                <div class="layout-logo">
                    Yoho! <b>BI</b>
                </div>
                <div class="layout-nav">
                    <i-menu-item name="design.project.list">
                        <i-icon type="ios-navigate"></i-icon>
                        工作台
                    </i-menu-item>
                    <i-menu-item name="design.statement.project.list">
                        <i-icon type="ios-speedometer"></i-icon>
                        报表
                    </i-menu-item>
                    <i-menu-item name="">
                        <i-icon type="settings"></i-icon>
                        <i-dropdown @on-click="navigte" trigger="click">
                            设置
                            <i-icon type="arrow-down-b"></i-icon>
                            <i-dropdown-menu slot="list">
                                <i-dropdown-item name="design.database.list">数据库管理</i-dropdown-item>
                                <!-- <i-dropdown-item name="design.database.filter">数据过滤管理</i-dropdown-item> -->
                                <i-dropdown-item name="manage.user.list">用户管理</i-dropdown-item>
                                <i-dropdown-item name="manage.role.list">角色管理</i-dropdown-item>
                            </i-dropdown-menu>
                        </i-dropdown>
                    </i-menu-item>
                </div>
                <div class="header-user">
                    <i-dropdown @on-click="userEvent" placement="bottom-end" trigger="click">
                        {{user.user.displayName}} <span class="role">[{{user.user.roleName}}]</span>
                        <i-icon type="arrow-down-b"></i-icon>
                        <i-dropdown-menu slot="list">
                            <i-dropdown-item name="logout">退出</i-dropdown-item>
                        </i-dropdown-menu>
                    </i-dropdown>
                </div>
            </i-menu>
        </div>
        <div class="layout-page">
            <div class="tools" v-if="tools">
                <slot name="tools"></slot>
            </div>
            <div class="breadcrumbs">
                <slot name="breadcrumb"></slot>
            </div>
            <div class="layout-content" :style="{padding: `0 ${gap}px ${gap}px ${gap}px`}">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex';
import bus from 'utils/bus';

export default {
  name: 'LayoutPage',
  props: {
    noHeader: Boolean,
    gap: {
      type: Number,
      default: 20
    }
  },
  computed: {
    ...mapState(['user'])
  },
  data() {
    return {
      tools: false
    };
  },
  mounted() {
    if (this.$slots.tools) {
      this.tools = true;
    }
  },
  methods: {
    navigte(menuName) {
      if (menuName) {
        this.$router.push({name: menuName});
      }
    },
    userEvent(evtName) {
      if (evtName === 'logout') {
        bus.$emit('logout', {isRefer: false});
      }
    }
  }
};
</script>

<style lang="scss">
.layout {
  display: grid;
  grid-template-rows: 60px 1fr;
  grid-template-columns: 1fr;
  user-select: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  background: #f5f7f9;
  z-index: 1;

  &.no-header {
    grid-template-rows: 1fr;
    grid-template-columns: 1fr;
  }
}

.header-menu {
  display: flex !important;

  .header-user {
    cursor: pointer;
    width: 150px;
    text-align: right;
    color: #fff;
    padding-right: 20px;
    font-size: 14px;

    .role {
      font-size: 12px;
    }

    .ivu-select-dropdown {
      text-align: left;
    }
  }

  .layout-nav {
    flex: 1;
  }

  .layout-logo {
    width: 200px;
    font-size: 30px;
    float: left;
    color: #fff;
    padding-left: 20px;
  }
}

.layout-page {
  overflow: hidden;
  grid-template-rows: auto auto 1fr;
  grid-template-columns: auto;
  grid-template-areas: "tools" "breadcrumbs" "layout-content"; /* stylelint-disable-line */
  display: grid;

  .tools {
    height: 31px;
    grid-area: tools;
    background: #fff;
    padding-left: 20px;
    padding-right: 20px;
    border-bottom: solid 1px #e9eaec;
    font-weight: bold;
    padding-bottom: 2px;

    .ivu-dropdown:first-child {
      .title {
        background: #2d8cf0;
        color: #fff;

        &:hover {
          background: #57a3f3;
        }
      }
    }

    .title {
      font-size: 13px;
      cursor: pointer;
      display: block;
      height: 28px;
      line-height: 28px;
      padding-left: 5px;
      padding-right: 5px;
      min-width: 50px;
      text-align: center;

      &:hover {
        background: #dedede;
      }
    }
  }

  .breadcrumbs {
    height: 40px;
    grid-area: breadcrumbs;
    line-height: 40px;
    padding: 0 20px;
  }

  .layout-content {
    align-self: stretch;
    grid-area: layout-content;
    overflow: hidden;
  }
}
</style>
