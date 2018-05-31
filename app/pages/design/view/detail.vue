<template>
    <layout-page>
        <div class="view-opts" slot="tools">
            <i-dropdown placement="bottom-start" trigger="click" @on-click="toolsClick">
                <span class="title">视图</span>
                <i-dropdown-menu slot="list">
                    <i-dropdown-item name="save">保存</i-dropdown-item>
                    <i-dropdown-item name="rename">重命名</i-dropdown-item>
                </i-dropdown-menu>
            </i-dropdown>
            <i-dropdown placement="bottom-start" trigger="click" @on-click="toolsClick">
                <span class="title">帮助</span>
                <i-dropdown-menu slot="list">
                    <i-dropdown-item name="help">帮助</i-dropdown-item>
                </i-dropdown-menu>
            </i-dropdown>
        </div>
        <i-breadcrumb slot="breadcrumb">
            <i-breadcrumb-item>首页</i-breadcrumb-item>
            <i-breadcrumb-item :to="{name: 'design.project.list'}">项目列表</i-breadcrumb-item>
            <i-breadcrumb-item
                :to="{name: 'design.view.list', params: {pid: viewData.project_id}}">
                {{viewData.project_name}}
            </i-breadcrumb-item>
            <i-breadcrumb-item v-if="viewData.view_name">{{viewData.view_name}}</i-breadcrumb-item>
        </i-breadcrumb>

        <div class="view-detail">
            <worksheets-card class="table" :project-id="viewData.project_id"></worksheets-card>
            <dashboard-card ref="dashboardCard" class="group" :view-id="viewData.id" :project-id="viewData.project_id"></dashboard-card>
        </div>

        <modal-view-edit ref="modalViewEdit" :auto-save="saveBase" @edited="onViewNameEdit"></modal-view-edit>
        <modal-roles ref="filterRoleDialog" @save="saveRole" :viewId="viewData.id" ></modal-roles>
    </layout-page>
</template>

<script>
import _ from 'lodash';
import {mapState} from 'vuex';
import components from './components';
import * as Types from 'store/view/types';
import * as ProjectTypes from 'store/project/types';
import ModalViewEdit from 'components/modal/modal-view';

export default {
  name: 'ViewDetail',
  computed: {
    ...mapState(['view', 'project', 'role']),
  },
  data() {
    return {
      saveBase: false,
      viewData: {
        id: 0,
        view_name: '',
        project_id: 0,
        project_name: '',
      },
    };
  },
  async created() {
    const {id: viewId = 0, pid: projectId = 0} = this.$route.params;

    this.viewData.id = _.parseInt(viewId);
    this.viewData.project_id = _.parseInt(projectId);
    this.fetchViewData(viewId);
    this.renderBreadcrumb(projectId);
  },
  methods: {
    async renderBreadcrumb(projectId) {
      const result = await this.$store.dispatch(ProjectTypes.FETCH_PROJECT_REQUEST, {project_id: projectId});

      if (result && result.code === 200) {
        this.viewData.project_id = result.data.id;
        this.viewData.project_name = result.data.project_name;
      }
    },
    async fetchViewData(viewId) {
      const viewData = await this.$store.dispatch(Types.VIEW_FETCH_REQUEST, {
        id: viewId
      });

      Object.assign(this.viewData, viewData);
    },
    toolsClick(args) {
      if (args === 'save') {
        this.saveBase = false;
        this.saveData();
      } else if (args === 'rename') {
        this.saveBaseData();
      }
    },
    async saveData() {
      const {view_name} = this.viewData;

      if (!view_name) {
        this.saveBase = false;
        this.$refs.modalViewEdit.show();
        return;
      }
      const result = await this.$store.dispatch(Types.SAVE_DASHBOARDS_REQUEST, this.viewData);

      if (result) {
        if (result.code === 200) {
          // 更新URL连接
          if (this.viewData.id !== result.data.id) {
            this.$router.push({
              name: 'design.view.detail',
              params: {pid: this.$route.params.pid, id: result.data.id}
            });
          }

          this.viewData.id = result.data.id;
          this.$Message.success('视图保存成功');
          this.filterRole();
        } else {
          this.$Message.warning(result.message);
        }
      }
    },
    async saveBaseData() {
      this.saveBase = true;
      this.$refs.modalViewEdit.show(_.clone(this.viewData));
    },
    async onViewNameEdit(viewData) {
      if (this.saveBase) {
        Object.assign(this.viewData, viewData);
        return;
      }

      this.viewData.view_name = viewData.view_name;
      await this.saveData();
      this.filterRole();
    },
    filterRole() {
      this.$refs.filterRoleDialog.show(this.viewData.roles);
    },
    saveRole() {
      this.$Message.success('视图角色保存成功');
    },
  },
  components: {...components, ModalViewEdit},
};
</script>

<style lang="scss">
.view-detail {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 300px 1fr;
  grid-template-rows: 100%;
  grid-template-areas: "table group"; /* stylelint-disable-line */
  grid-gap: 10px;

  .table {
    grid-area: table;
  }

  .group {
    grid-area: group;
    min-width: 200px;
  }
}

.view-opts {
  .title {
    font-size: 13px;
    cursor: pointer;
    display: block;
    height: 30px;
    line-height: 30px;
    padding-left: 5px;
    padding-right: 5px;

    &:hover {
      background: #dedede;
    }
  }

  .publish-item {
    padding: 0;

    .publish-a {
      color: inherit;
      display: inline-block;
      width: 100%;
      height: 100%;
      padding: 7px 16px;
    }
  }

  .disable {
    .publish-a {
      text-decoration: line-through;
      cursor: no-drop;
      color: #bbbec4;
    }
  }
}

.ivu-card-body {
  padding: 10px;
  height: inherit;
}
</style>
