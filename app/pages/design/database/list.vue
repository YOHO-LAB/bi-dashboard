<template>
    <layout-page class="database-list-page">
        <i-breadcrumb slot="breadcrumb">
            <i-breadcrumb-item>首页</i-breadcrumb-item>
            <i-breadcrumb-item>数据库配置</i-breadcrumb-item>
        </i-breadcrumb>
        <layout-content-card>
            <p slot="title">数据库配置</p>
            <card-data
                class="database-item"
                @click.native="editDatabse(db)"
                v-for="db in databases"
                :key="db.id">
                <p slot="title">{{db.name || '无'}}</p>
                <p slot="extra">
                    <i-icon type="compose" @click.native.stop="editDatabse(db)"></i-icon>
                    <i-icon type="close" @click.native.stop="deleteDatabase(db)"></i-icon>
                </p>
                <div class="content">
                    <p>服务器:{{db.db_host}}</p>
                    <p>端口:{{db.db_port}}</p>
                    <p>数据库:{{db.db_name}}</p>
                    <p>用户:{{db.db_user}}</p>
                </div>
            </card-data>
            <card-data class="database-item" :shadow="false" border-style="dashed" @click.native="editDatabse()">
                <div class="database-plus">
                    <i-icon type="plus"></i-icon>
                </div>
            </card-data>
        </layout-content-card>
        <modal-database-edit ref="databaseEdit" @created="dbCreated"></modal-database-edit>
    </layout-page>
</template>

<script>
import * as Types from 'store/database/types';
import {mapState} from 'vuex';
import _ from 'lodash';
import ModalDatabaseEdit from './components/modal-database-edit';

export default {
  name: 'Project',
  computed: {
    ...mapState(['database']),
  },
  data() {
    return {
      databases: []
    };
  },
  created() {
    this.queryData();
  },
  methods: {
    async queryData() {
      const result = await this.$store.dispatch(Types.FETCH_DATABASES_REQUEST);

      if (result && result.code !== 200) {
        return this.$Message.warning(result.message);
      }
      this.databases = result.data;
    },
    editDatabse(database) {
      this.$refs.databaseEdit.show(_.clone(database));
    },
    dbCreated() {
      this.queryData();
    },
    deleteDatabase(database) {
      this.$Modal.confirm({
        title: '询问',
        content: `确认删除"${database.db_host}"的数据库连接？`,
        closable: true,
        onOk: async() => {
          const result = await this.$store.dispatch(Types.DELETE_DATABASE_REQUEST, {id: database.id});

          if (result && result.code === 200) {
            this.$Message.success('删除成功');
            this.queryData();
          } else {
            this.$Message.warning(result.message || '');
          }
        }
      });
    }
  },
  components: {ModalDatabaseEdit}
};
</script>

<style lang="scss">
.database-list-page {
  .database-item {
    width: 200px;
    height: 140px;

    .database-plus {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 60px;
      color: #dddee1;

      &:hover {
        color: #bbbbbd;
      }

      i {
        color: inherit;
      }
    }
  }

  .content {
    font-size: 12px;
  }
}
</style>
