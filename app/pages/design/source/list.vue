<template>
    <layout-page>
        <i-breadcrumb slot="breadcrumb">
            <i-breadcrumb-item>首页</i-breadcrumb-item>
            <i-breadcrumb-item :to="{name: 'design.project.list'}">项目列表</i-breadcrumb-item>
            <i-breadcrumb-item>数据源</i-breadcrumb-item>
        </i-breadcrumb>
        <layout-content-card class="source-list-page">
            <p slot="title">{{projectName}}-数据源</p>
            <card-data
                class="source-item"
                v-for="source in sources"
                :key="source.id"
                @click.native="toEditSourcePage({}, source.id)">
                <p slot="title">{{source.source_name}}</p>
                <p slot="extra">
                    <i-icon type="compose" @click.native.stop="editSourceName(source)"></i-icon>
                    <i-icon type="close" @click.native.stop="deleteSource(source)"></i-icon>
                </p>
                <p class="time">{{source.created_at}}</p>
            </card-data>
            <card-data class="source-item" :shadow="false" border-style="dashed" @click.native="createSource()">
                <div class="source-plus">
                    <i-icon type="plus"></i-icon>
                </div>
            </card-data>
        </layout-content-card>
        <modal-source ref="sourceEdit" :auto-save="true" @edited="onEditedName"></modal-source>
        <modal-select-database ref="selectDatabase" @on-select="toEditSourcePage"></modal-select-database>
    </layout-page>
</template>

<script>
import {
  FETCH_SOURCES_REQUEST,
} from 'store/project/types';
import {mapState} from 'vuex';
import createApi from 'create-api';
import ModalSource from 'components/modal/modal-source';
import _ from 'lodash';

export default {
  name: 'SourcePage',
  computed: {
    ...mapState(['project']),
    sources() {
      return _.get(this.project.sources, `[${this.$route.params.pid}]`, []);
    },
    projectName() {
      return _.get(this.project.projectCaches, `[${this.$route.params.pid}].project_name`, '');
    }
  },
  created() {
    this.$store.dispatch(FETCH_SOURCES_REQUEST, {project_id: this.$route.params.pid});
  },
  methods: {
    editSourceName(source) {
      this.$refs.sourceEdit.show(_.clone(source));
    },
    onEditedName() {
      this.$store.dispatch(FETCH_SOURCES_REQUEST, {project_id: this.$route.params.pid});
    },
    deleteSource(source) {
      this.$Modal.confirm({
        title: '询问',
        content: `确认删除"${source.source_name}"数据源？`,
        closable: true,
        onOk: async() => {
          const result = await createApi.post('/source/delete-data', {id: source.id});

          if (result.code === 200) {
            this.$Message.success('删除成功');
            this.$store.dispatch(FETCH_SOURCES_REQUEST, {project_id: this.$route.params.pid});
          } else {
            this.$Message.warning(result.message);
          }
        }
      });
    },
    createSource() {
      this.$refs.selectDatabase.show();
    },
    toEditSourcePage({databaseId}, id = 0) {
      this.$router.push({
        name: 'design.source.detail',
        params: {id},
        query: {databaseId, pid: this.$route.params.pid}
      });
    }
  },
  components: {ModalSource}
};
</script>

<style lang="scss">
.source-list-page {
  .source-item {
    width: 200px;
    height: 120px;

    .time {
      font-size: 12px;
      margin-top: 10px;
    }

    .source-plus {
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
}
</style>
