<template>
    <layout-page>
        <i-breadcrumb slot="breadcrumb">
            <i-breadcrumb-item>首页</i-breadcrumb-item>
            <i-breadcrumb-item :to="{name: 'design.project.list'}">项目列表</i-breadcrumb-item>
            <i-breadcrumb-item>视图</i-breadcrumb-item>
        </i-breadcrumb>
        <layout-content-card class="view-list-page">
            <p slot="title">{{projectName}}-视图</p>
            <card-data
                class="view-item"
                v-for="view in views"
                :key="view.id"
                @click.native="createView(view)">
                <p slot="title">{{view.view_name}}</p>
                <p slot="extra">
                    <i-icon type="compose" @click.native.stop="editView(view)"></i-icon>
                    <i-icon type="close" @click.native.stop="deleteView(view)"></i-icon>
                </p>
                <p class="time">{{view.created_at}}</p>
            </card-data>
            <card-data class="view-item" :shadow="false" border-style="dashed" @click.native="createView()">
                <div class="view-plus">
                    <i-icon type="plus"></i-icon>
                </div>
            </card-data>
        </layout-content-card>
        <modal-view ref="viewEdit" :auto-save="true" @edited="viewEdit"></modal-view>
    </layout-page>
</template>

<script>
import {
  FETCH_VIEWS_REQUEST
} from 'store/project/types';
import {
  VIEW_WORKSHEETS_FETCH_REQUEST
} from 'store/view/types';
import createApi from 'create-api';
import {mapState} from 'vuex';
import ModalView from 'components/modal/modal-view';
import _ from 'lodash';

export default {
  name: 'ViewsPage',
  computed: {
    ...mapState(['project']),
    views() {
      return _.get(this.project.views, `[${this.$route.params.pid}]`, []);
    },
    projectName() {
      return _.get(this.project.projectCaches, `[${this.$route.params.pid}].project_name`, '');
    }
  },
  created() {
    this.$store.dispatch(FETCH_VIEWS_REQUEST, {project_id: this.$route.params.pid});
  },
  methods: {
    editView(views) {
      this.$refs.viewEdit.show(_.clone(views));
    },
    deleteView(views) {
      this.$Modal.confirm({
        title: '询问',
        content: `确认删除"${views.view_name}"视图？`,
        closable: true,
        onOk: async() => {
          const result = await createApi.post('/view/delete-data', {id: views.id});

          if (result.code === 200) {
            this.$Message.success('删除成功');
            this.$store.dispatch(FETCH_VIEWS_REQUEST, {project_id: this.$route.params.pid});
          } else {
            this.$Message.warning(result.message);
          }
        }
      });
    },
    viewEdit() {
      this.$store.dispatch(FETCH_VIEWS_REQUEST, {project_id: this.$route.params.pid});
    },
    createView(views) {
      this.$store.commit(VIEW_WORKSHEETS_FETCH_REQUEST);
      this.$router.push({
        name: 'design.view.detail',
        params: {pid: this.$route.params.pid, id: _.get(views, 'id', 0)}
      });
    }
  },
  components: {ModalView}
};
</script>

<style lang="scss">
.view-list-page {
  .view-item {
    width: 200px;
    height: 120px;

    .time {
      font-size: 12px;
      margin-top: 10px;
    }

    .view-plus {
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
