<template>
    <layout-page>
        <i-breadcrumb slot="breadcrumb">
            <i-breadcrumb-item>首页</i-breadcrumb-item>
            <i-breadcrumb-item>报表</i-breadcrumb-item>
        </i-breadcrumb>
        <layout-multi-tab-card class="project-list-page">
            <div slot="extra">
                <i-page v-if="activeTab === 'tab1'"
                class="pager"
                :total="statement.count"
                :current="statement.page"
                :page-size="statement.size"
                @on-change="page => this.getViews({page})"
                simple></i-page>
                <i-page v-if="activeTab === 'tab2'"
                class="pager"
                :total="statement.project.count"
                :current="statement.project.page"
                :page-size="statement.project.size"
                @on-change="page => this.query({page})"
                simple></i-page>
            </div>
            <Tabs :value="activeTab" @on-click="switchTab">
                <TabPane label="所有视图" name="tab1">
                    <card-data
                        class="view-item"
                        v-for="view in views"
                        :key="view.id"
                        @click.native="singleView(view)">
                        <p slot="title">{{view.view_name}}</p>
                        <p class="time">{{view.created_at | time-format}}</p>
                    </card-data>
                </TabPane>
                <TabPane label="项目" name="tab2">
                    <div class="projects">
                        <card-data
                            class="project-item"
                            v-for="proj in projects"
                            :key="proj.id"
                            @click.native="goViews(proj)">
                            <p class="title" slot="title" @click="goViews(proj)">
                                <i-icon type="android-globe"  title="公开"></i-icon>
                                {{proj.project_name}}
                            </p>
                            <p class="intro" @click="goViews(proj)">{{proj.project_intro}}</p>
                            <div class="totals">
                                <div class="icon">
                                    <router-link :to="{name: 'design.statement.project.view.list', params: {pid: proj.id}}">
                                        <i-icon type="ios-speedometer-outline" class="icon-in-link"></i-icon>
                                        <span class="text-in-link">{{proj.visibleSumView}}</span>
                                    </router-link>
                                </div>
                            </div>
                        </card-data>
                    </div>
                </TabPane>
            </Tabs>

        </layout-multi-tab-card>
    </layout-page>
</template>

<script>
import {mapState} from 'vuex';
import * as Types from 'store/statement/types';

export default {
  name: 'Project',
  computed: {
    ...mapState(['project']),
    ...mapState(['statement'])
  },
  data() {
    return {
      activeTab: 'tab1',
      views: [],
      projects: []
    };
  },
  created() {
    this.getViews({});
    this.query({});
  },
  methods: {
    async query({page}) {
      const result = await this.$store.dispatch(Types.STATEMENT_PROJECTS_REQUEST, {page});

      if (result && result.code !== 200) {
        return this.$Message.warning(result.message);
      }
      this.projects = result.data.rows;
    },
    async getViews({page}) {
      const result = await this.$store.dispatch(Types.STATEMENT_ALL_VIEWS_REQUEST, {page});

      if (result && result.code !== 200) {
        return this.$Message.warning(result.message);
      }
      this.views = result.data.rows;
    },
    goViews(proj) {
      this.$router.push({
        name: 'design.statement.project.view.list',
        params: {pid: proj.id}
      });
    },
    async singleView(views) {
      this.$router.push({
        name: 'design.statement.project.view.detail',
        params: {id: views.id, pid: this.$route.params.pid}
      });
    },
    switchTab(name) {
      this.activeTab = name;
    }
  }
};
</script>

<style lang="scss">
.project-list-page {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
  overflow: hidden;

  & > .ivu-card-body {
    overflow: hidden;
  }

  .projects {
    margin-left: -10px;
    margin-right: -10px;
    overflow-y: auto;
    height: 100%;
  }

  .card-data {
    width: 320px;
    height: 240px;
  }

  .view-item {
    width: 200px;
    height: 120px;

    .time {
      font-size: 12px;
      margin-top: 10px;
    }
  }
}

.project-item {
  .title {
    border-bottom: 1px solid #e9eaec;
  }

  .intro {
    font-size: 13px;
    margin-top: 5px;
  }

  .totals {
    position: absolute;
    bottom: 10px;
    color: #333;
  }

  .icon-in-link {
    color: #333;
  }

  .text-in-link {
    font-size: 12px;
  }
}
</style>
