<template>
    <layout-page>
        <div class="worksheet-opts" slot="tools">
            <i-dropdown placement="bottom-start" trigger="click" @on-click="toolsClick">
                <span class="title">角色</span>
                <i-dropdown-menu slot="list">
                    <i-dropdown-item name="create">新建</i-dropdown-item>
                </i-dropdown-menu>
            </i-dropdown>
        </div>
        <i-breadcrumb slot="breadcrumb">
            <i-breadcrumb-item>首页</i-breadcrumb-item>
            <i-breadcrumb-item>角色列表</i-breadcrumb-item>
        </i-breadcrumb>
        <layout-content-card>
            <p slot="title">角色列表</p>
            <i-table :columns="columns" :data="role.roles"></i-table>
        </layout-content-card>
        <modal-edit ref="modalEdit"></modal-edit>
        <modal-purview-edit ref="modalPurviewEdit"></modal-purview-edit>
    </layout-page>
</template>

<script>
import * as Types from 'store/role/types';
import {mapState} from 'vuex';
import {Button} from 'iview';
import components from './components';

export default {
  name: 'UserList',
  computed: {
    ...mapState(['role'])
  },
  data() {
    return {
      columns: [{
        title: '角色名',
        key: 'roleName'
      }, {
        title: '操作',
        render: (h, {row}) => {
          return (
            <div>
              &nbsp;<i-button type="primary" onClick={() => this.edit(row)}>编辑</i-button>
              &nbsp;<i-button type="success" onClick={() => this.editPurview(row)}>编辑权限</i-button>
              &nbsp;{row.id !== 1 ? (<i-button type="warning" onClick={() => this.delete(row)}>删除</i-button>) : (void 0)}
            </div>
          );
        }
      }],
      data: [],
    };
  },
  created() {
    if (!this.role.roles.length) {
      this.query({});
    }
  },
  methods: {
    async toolsClick(args) {
      if (args === 'create') {
        this.$refs.modalEdit.show();
      }
    },
    edit({id}) {
      this.$refs.modalEdit.show(id);
    },
    editPurview({id}) {
      this.$refs.modalPurviewEdit.show(id);
    },
    delete({id, roleName}) {
      this.$Modal.confirm({
        title: '询问',
        content: `确认删除"${roleName}"？`,
        closable: true,
        onOk: async() => {
          const result = await this.$store.dispatch(Types.DELETE_ROLE_REQUEST, {id});

          if (result) {
            if (result.code === 200) {
              this.$store.dispatch(Types.FETCH_ROLES_REQUEST, {});
              this.$Message.warning('删除成功');
            } else {
              this.$Message.warning(result.message);
            }
          }
        }
      });
    },
    async query({page, size}) {
      const result = await this.$store.dispatch(Types.FETCH_ROLES_REQUEST, {page, size});

      if (result && result.code !== 200) {
        this.$Message.warning(result.message);
      }
    }
  },
  components: {Button, ...components}
};
</script>

<style lang="scss">
</style>
