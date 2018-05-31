<template>
    <i-card class="database-card flex-card">
        <p slot="title">数据连接</p>
        <div class="plus-database" title="添加数据连接" @click="editDatabse()">
            <i-icon type="plus"></i-icon>
        </div>
        <ul class="database-list">
            <i-card
                class="database-item"
                v-for="db in database.databases"
                :key="db.id">
                 <div>
                    <p>服务器：{{db.db_host}}</p>
                    <p>数据库：{{db.db_name}}</p>
                </div>
                <p slot="extra" class="extra">
                    <i-icon type="compose" @click.native.stop="editDatabse(db)"></i-icon>
                    <i-icon type="close" @click.native.stop="deleteDatabase(db)"></i-icon>
                </p>
            </i-card>
        </ul>
        <modal-database-edit ref="databaseEdit" @created="dbCreated"></modal-database-edit>
    </i-card>
</template>

<script>
import _ from 'lodash';
import createApi from 'create-api';
import {mapState} from 'vuex';
import ModalDatabaseEdit from './modal-database-edit';
import {
  FETCH_DATABASES_REQUEST
} from 'store/database/types';

export default {
  name: 'DatabaseCard',
  computed: {
    ...mapState(['database'])
  },
  created() {
    this.$store.dispatch(FETCH_DATABASES_REQUEST);
  },
  methods: {
    editDatabse(database) {
      this.$refs.databaseEdit.show(_.clone(database));
    },
    dbCreated() {
      this.$store.dispatch(FETCH_DATABASES_REQUEST, {reload: true});
    },
    deleteDatabase(database) {
      this.$Modal.confirm({
        title: '询问',
        content: `确认删除"${database.db_host}"的数据库连接？`,
        closable: true,
        onOk: async() => {
          const result = await createApi.get('/database/delete-data', {
            id: database.id
          });

          if (result.code === 200) {
            this.$Message.success('删除成功');
            this.$store.dispatch(FETCH_DATABASES_REQUEST, {reload: true});
          } else {
            this.$Message.warning(result.message);
          }
        }
      });
    }
  },
  components: {ModalDatabaseEdit}
};
</script>

<style lang="scss">
.database-card {
  overflow: hidden;

  .plus-database {
    cursor: pointer;
    width: 100%;
    border: dashed 1px #dddee1;
    border-radius: 3px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    font-size: 25px;
    font-weight: bold;
    color: #dddee1;

    &:hover {
      border: 1px dashed #bbbbbd;
      color: #bbbbbd;
    }
  }

  & > .ivu-card-body {
    padding: 8px;
    display: flex;
    flex-direction: column;
  }

  .database-list {
    margin-top: 20px;
    flex: 1;
    overflow-y: auto;

    .database-item {
      cursor: pointer;
      font-size: 12px;
      margin-top: 10px;

      &:hover {
        .extra {
          display: initial;
        }
      }

      .ivu-card-body {
        padding: 8px;
      }

      .ivu-card-extra {
        top: 5px;
        right: 5px;
      }

      .extra {
        display: none;

        .ivu-icon {
          cursor: pointer;
          margin-left: 5px;
          color: #80848f;
        }

        .ivu-icon:hover {
          color: #000;
        }
      }
    }
  }
}
</style>
