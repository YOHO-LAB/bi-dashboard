<template>
    <layout-page>
        <i-breadcrumb slot="breadcrumb">
            <i-breadcrumb-item>首页</i-breadcrumb-item>
            <i-breadcrumb-item>报表</i-breadcrumb-item>
            <i-breadcrumb-item>{{projectName}}</i-breadcrumb-item>
        </i-breadcrumb>
        <layout-content-card class="view-list-page">
            <p slot="title">视图</p>
            <div slot="extra">
                <i-page
                    class="pager"
                    :total="statement.view.count"
                    :current="statement.view.page"
                    :page-size="statement.view.size"
                    @on-change="page => this.getViews({page})"
                    simple>
                </i-page>
            </div>
            <card-data
                class="view-item"
                v-for="view in views"
                :key="view.id"
                @click.native="singleView(view)">
                <p slot="title">{{view.view_name}}</p>
                <p class="time">{{view.created_at}}</p>
            </card-data>
        </layout-content-card>
    </layout-page>
</template>

<script>
import {mapState} from 'vuex';
import * as Types from 'store/statement/types';

export default {
  name: 'ProjectViewsList',
  computed: {
    ...mapState(['statement'])
  },
  data() {
    return {
      views: [],
      projectName: ''
    };
  },
  async created() {
    this.getViews({});
  },
  methods: {
    async getViews({page}) {
      let result = await this.$store.dispatch(Types.STATEMENT_PROJECT_VIEWS_REQUEST, {project_id: this.$route.params.pid, page});

      if (result && result.code !== 200) {
        return this.$Message.warning(result.message);
      }
      this.views = result.data.rows;
      this.projectName = result.data.project_name;
    },
    async singleView(views) {
      this.$router.push({
        name: 'design.statement.project.view.detail',
        params: {id: views.id, pid: this.$route.params.pid}
      });
    }
  }
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
      }
    }
</style>
