<template>
    <layout-page>
        <i-breadcrumb slot="breadcrumb">
            <i-breadcrumb-item>首页</i-breadcrumb-item>
            <i-breadcrumb-item>项目列表</i-breadcrumb-item>
        </i-breadcrumb>
        <layout-content-card class="project-list-page">
            <p slot="title">项目</p>
            <div slot="extra">
                <i-page class="pager"
                :total="project.count"
                :current="project.page"
                :page-size="project.size"
                @on-change="page => this.query({page})"
                simple></i-page>
            </div>
            <div class="projects">
                <i-card
                    class="project"
                    v-for="proj in project.projects"
                    :key="proj.id">
                    <router-link :to="{name: 'design.worksheet.list', params: {pid: proj.id}}">
                        <p class="title">
                            <i-icon type="android-globe" v-if="proj.is_public" title="公开"></i-icon>
                            <i-icon type="locked" v-else title="私有"></i-icon>
                                {{proj.project_name}}
                        </p>
                    </router-link>
                    <p class="intro">{{proj.project_intro}}</p>
                    <div class="totals">
                        <div class="icon">
                            <router-link :to="{name: 'design.worksheet.list', params: {pid: proj.id}}">
                                <i-icon type="ios-folder-outline"></i-icon>
                                <span>{{proj.sumWorksheet}}</span>
                            </router-link>
                        </div>
                        <div class="icon">
                            <router-link :to="{name: 'design.view.list', params: {pid: proj.id}}">
                                <i-icon type="ios-speedometer-outline"></i-icon>
                                <span>{{proj.sumView}}</span>
                            </router-link>
                        </div>
                        <div class="icon">
                            <router-link :to="{name: 'design.source.list', params: {pid: proj.id}}">
                                <i-icon type="funnel"></i-icon>
                                <span>{{proj.sumSource}}</span>
                            </router-link>
                        </div>
                    </div>
                    <p slot="extra" class="extra">
                        <i-icon type="compose" @click.native.stop="editProject(proj)"></i-icon>
                        <i-icon type="close" @click.native.stop="deleteProject(proj)"></i-icon>
                    </p>
                </i-card>
                <div class="project project-plus" title="添加项目" @click="editProject()">
                    <i-icon type="plus"></i-icon>
                </div>
            </div>
        </layout-content-card>
        <modal-project-edit ref="projectEdit" @created="projectCreated"></modal-project-edit>
    </layout-page>
</template>

<script>
import createApi from 'create-api';
import {mapState} from 'vuex';
import ModalProjectEdit from './components/modal-project-edit';
import {
  FETCH_PROJECTS_REQUEST,
} from 'store/project/types';

export default {
  name: 'Project',
  computed: {
    ...mapState(['project'])
  },
  created() {
    this.query(FETCH_PROJECTS_REQUEST, {});
  },
  methods: {
    async query({page, size}) {
      const result = await this.$store.dispatch(FETCH_PROJECTS_REQUEST, {page, size});

      if (result && result.code !== 200) {
        this.$Message.warning(result.message);
      }
    },
    editProject(project) {
      this.$refs.projectEdit.show(project);
    },
    projectCreated() {
      this.query(FETCH_PROJECTS_REQUEST, {});
    },
    deleteProject(project) {
      this.$Modal.confirm({
        title: '询问',
        content: `确认删除"${project.project_name}"项目？`,
        closable: true,
        onOk: async() => {
          const result = await createApi.get('/project/delete-data', {
            id: project.id
          });

          if (result.code === 200) {
            this.$Message.success('删除成功');
            this.query(FETCH_PROJECTS_REQUEST, {});
          } else {
            this.$Message.warning(result.message);
          }
        }
      });
    }
  },
  components: {ModalProjectEdit}
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
}

.project {
  float: left;
  width: 250px;
  height: 200px;
  margin: auto 10px 20px;
  position: relative;

  & > .ivu-card-body {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-rows: 41px 1fr 30px;
    grid-template-columns: auto;
    padding: 0;
  }

  .title {
    font-size: 13px;
    font-weight: bold;
    border-bottom: solid 1px #e9eaec;
    padding-top: 16px;
    margin-left: 16px;
    margin-right: 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #367e9c;

    .ivu-icon {
      color: #999;
      margin-right: 5px;
    }
  }

  .intro {
    margin-top: 10px;
    margin-left: 16px;
    margin-right: 16px;
    font-size: 12px;
    flex: 1;
    overflow-y: auto;
  }

  .totals {
    background-color: #fafafa;
    text-align: center;
    align-items: center;
    font-size: 12px;
    border-top: solid 1px #e9eaec;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;

    .icon {
      flex: 1;
      cursor: pointer;
      color: #367e9c;

      span:hover {
        text-decoration: underline;
      }

      i {
        font-size: 15px;
        margin-right: 5px;
        color: #333;
      }
    }
  }

  &:hover {
    .extra {
      display: initial;
    }
  }

  .extra {
    display: none;

    .ivu-icon {
      cursor: pointer;
      margin-left: 5px;
      color: #80848f;

      &:hover {
        color: #000;
      }
    }
  }

  &.project-plus {
    cursor: pointer;
    border: dashed 1px #dddee1;
    border-radius: 3px;
    color: #dddee1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 60px;

    &:hover {
      border: 1px dashed #bbbbbd;
      color: #bbbbbd;
    }
  }
}
</style>
