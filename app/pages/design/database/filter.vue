<template>
    <layout-page>
        <div class="worksheet-opts" slot="tools">
            <i-dropdown placement="bottom-start" trigger="click" @on-click="toolsClick">
                <span class="title">数据过滤</span>
                <i-dropdown-menu slot="list">
                    <i-dropdown-item name="create">新建</i-dropdown-item>
                </i-dropdown-menu>
            </i-dropdown>
        </div>
        <i-breadcrumb slot="breadcrumb">
            <i-breadcrumb-item>首页</i-breadcrumb-item>
            <i-breadcrumb-item>数据过滤列表</i-breadcrumb-item>
        </i-breadcrumb>
        <layout-content-card>
            <p slot="title">数据过滤列表</p>
            <i-table :columns="columns" :data="data"></i-table>
        </layout-content-card>
        <modal-filter-edit ref="modalFilterEdit" @on-filter-edited="onFilterEdited"></modal-filter-edit>
        <modal-select-database ref="selectDatabase" @on-select="onDatabaseSelected"></modal-select-database>
    </layout-page>
</template>

<script>
import * as Types from 'store/database/types';
import ModalFilterEdit from './components/modal-filter-edit';
import {Button} from 'iview';

export default {
  name: 'DatabaseFilterList',
  data() {
    return {
      columns: [{
        title: '名称',
        key: 'filterName'
      }, {
        title: '数据库名',
        key: 'databaseName'
      }, {
        title: 'scheme',
        key: 'schemeName'
      }, {
        title: 'table',
        key: 'tableName'
      }, {
        title: 'field',
        key: 'fieldName'
      }, {
        title: '条件表达式',
        key: 'filterCondition'
      }, {
        title: '操作',
        render: (h, {row}) => {
          return (
            <div>
                            &nbsp;<i-button type="primary" onClick={() => this.onEdit(row)}>编辑</i-button>
                            &nbsp;{row.id !== 1 ? (<i-button type="warning" onClick={() => this.delete(row)}>删除</i-button>) : (void 0)}
            </div>
          );
        }
      }],
      data: [],
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    async toolsClick(args) {
      if (args === 'create') {
        this.$refs.selectDatabase.show();
      }
    },
    onEdit(model) {
      this.$refs.modalFilterEdit.show({model});
    },
    onDatabaseSelected({databaseId}) {
      this.$refs.modalFilterEdit.show({databaseId});
    },
    onFilterEdited() {
      this.fetchData();
    },
    delete({id, filterName}) {
      this.$Modal.confirm({
        title: '询问',
        content: `确认删除"${filterName}"？`,
        closable: true,
        onOk: async() => {
          const result = await this.$store.dispatch(Types.DELETE_DATABASE_FILTER, {id});

          if (result) {
            if (result.code === 200) {
              this.fetchData();
              this.$Message.warning('删除成功');
            } else {
              this.$Message.warning(result.message);
            }
          }
        }
      });
    },
    async fetchData() {
      const result = await this.$store.dispatch(Types.FETCH_DATABASE_FILTER);

      if (result && result.code !== 200) {
        this.$Message.warning(result.message);
      } else {
        this.data = result.data;
      }
    }
  },
  components: {Button, ModalFilterEdit}
};
</script>

<style lang="scss">
</style>
