<template>
    <layout-page>
        <div class="worksheet-opts" slot="tools" v-if="authType === 'account'">
            <i-dropdown placement="bottom-start" trigger="click" @on-click="toolsClick">
                <span class="title">用户</span>
                <i-dropdown-menu slot="list">
                    <i-dropdown-item name="create">新建</i-dropdown-item>
                </i-dropdown-menu>
            </i-dropdown>
        </div>
        <i-breadcrumb slot="breadcrumb">
            <i-breadcrumb-item>首页</i-breadcrumb-item>
            <i-breadcrumb-item>用户列表</i-breadcrumb-item>
        </i-breadcrumb>
        <layout-content-card>
            <p slot="title">用户列表</p>
            <i-table :columns="columns" :data="user.users"></i-table>
            <i-page
                class="pager"
                :total="user.count"
                :current="user.page"
                :page-size="user.size"
                show-sizer
                show-total
                placement="top"
                @on-change="page => this.query({page})"
                @on-page-size-change="size => this.query({size})"></i-page>
        </layout-content-card>
        <modal-edit ref="modalEdit"></modal-edit>
    </layout-page>
</template>

<script>
import config from 'config';
import * as Types from 'store/user/types';
import {mapState} from 'vuex';
import {Button} from 'iview';
import ModalEdit from './components/modal-edit';

export default {
  name: 'UserList',
  computed: {
    ...mapState(['user'])
  },
  data() {
    return {
      authType: '',
      columns: [{
        title: '姓名',
        key: 'realName'
      }, {
        title: '用户名',
        key: 'userName'
      }, {
        title: '角色',
        key: 'roleName'
      }, {
        title: '邮箱',
        key: 'email'
      }, {
        title: '状态',
        render: (h, {row}) => {
          return (
            <span>{row.status === 1 ? '启用' : '禁用'}</span>
          );
        }
      }, {
        title: '操作',
        render: (h, {row}) => {
          return (
            <div>
              {row.status === 1 ?
                <i-button type="warning" onClick={() => this.changeStatus(row, 0)}>禁用</i-button> :
                <i-button type="primary" onClick={() => this.changeStatus(row, 1)}>启用</i-button>}
                            &nbsp;
              <i-button type="primary" onClick={() => this.edit(row)}>编辑</i-button>
            </div>
          );
        }
      }],
      data: [],
    };
  },
  created() {
    this.authType = config.authType;
    if (!this.user.users.length) {
      this.query({});
    }
  },
  methods: {
    async toolsClick(args) {
      if (args === 'create') {
        this.$refs.modalEdit.show();
      }
    },
    edit(user) {
      this.$refs.modalEdit.show(user);
    },
    async changeStatus(user, status) {
      const result = await this.$store.dispatch(Types.CHANGE_USER_STATUS, {user, status});

      if (result) {
        if (result.code === 200) {
          this.$Message.success(`操作成功，${user.userName}已被${user.status === 1 ? '启用' : '禁用'}`);
        } else {
          this.$Message.warning(result.message || '修改失败');
        }
      }
    },
    async query({page, size}) {
      const result = await this.$store.dispatch(Types.FETCH_USERS_REQUEST, {page, size});

      if (result && result.code !== 200) {
        this.$Message.warning(result.message);
      }
    }
  },
  components: {Button, ModalEdit}
};
</script>

<style lang="scss">
</style>
