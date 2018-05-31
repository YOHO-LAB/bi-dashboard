<template>
    <layout-page>
        <div slot="tools">
            <i-dropdown placement="bottom-start" trigger="click" @on-click="toolsClick">
                <span class="title">数据源</span>
                <i-dropdown-menu slot="list">
                    <i-dropdown-item name="purview">预览&保存</i-dropdown-item>
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
                :to="{name: 'design.source.list', params: {pid: currentProject.id}}">
                {{currentProject.project_name}}
            </i-breadcrumb-item>
            <i-breadcrumb-item v-if="sourceData.source_name">{{sourceData.source_name}}</i-breadcrumb-item>
        </i-breadcrumb>

        <div class="source-detail">
            <i-card class="left">
                <p slot="title">
                    选择数据表
                    <i-tooltip placement="right-start">
                        <i-icon type="help-circled"></i-icon>
                        <div slot="content" class="remark">
                            <div>下拉选择Scheme</div>
                            <div>筛选出的表结果拖拽到右侧视图中</div>
                        </div>
                    </i-tooltip>
                </p>
                <select-scheme v-model="currentScheme" :database-id="sourceData.database_id"></select-scheme>
                <select-table :scheme-id="currentScheme"></select-table>
            </i-card>
            <i-card class="flex-card source-view-card">
                <p slot="title">
                    视图
                    <i-tooltip placement="right-start" v-if="database.sourceType === 'VIEW'">
                        <i-icon type="help-circled"></i-icon>
                        <div slot="content" class="remark">
                            <div>tips:</div>
                            <div>1.点击表格右侧下箭头添加关联和移除表格</div>
                            <div>2.点击关系线编辑关联关系</div>
                        </div>
                    </i-tooltip>
                </p>
                <div slot="extra">
                    <i-radio-group :value="database.sourceType" @on-change="onViewTypeChange">
                        <i-radio label="VIEW">视图</i-radio>
                        <i-radio label="SQL">SQL</i-radio>
                    </i-radio-group>
                </div>
                <source-view-box class="source-view" v-if="database.sourceType === 'VIEW'"></source-view-box>
                <textarea v-show="false" v-if="database.sourceType === 'SQL'" class="source-sql" ref="sqlBox" name="" id="" :value="database.sourceSql"></textarea>
            </i-card>
        </div>
        <modal-source-edit ref="modalSourceEdit" :auto-save="saveBase" @edited="onNameEdited"></modal-source-edit>
        <modal-data-purview ref="modalDataPurview" @on-save="onSave"></modal-data-purview>
    </layout-page>
</template>

<script>
import _ from 'lodash';
import {mapState} from 'vuex';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/hint/show-hint.js';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/sql-hint.js';
import 'codemirror/mode/sql/sql.js';
import codeMirror from 'codemirror';
import components from './components';
import * as ProjectTypes from 'store/project/types';
import * as DatabaseTypes from 'store/database/types';
import * as Types from 'store/source/types';
import ModalSourceEdit from 'components/modal/modal-source';

export default {
  name: 'SourceDetailPage',
  computed: {
    ...mapState(['source', 'project', 'database']),
    currentProject() {
      return this.$store.getters.getterProductInfo(this.$route.query.pid);
    }
  },
  data() {
    return {
      currentScheme: 0,
      saveBase: false,
      sourceData: {
        id: 0,
        project_id: 0,
        database_id: 0,
        source_name: ''
      }
    };
  },
  async created() {
    this.renderData();
  },
  methods: {
    async renderData() {
      this.$store.dispatch(ProjectTypes.LOAD_PROHECT_INFO, {project_id: this.$route.query.pid});
      const id = _.parseInt(this.$route.params.id || '0');

      if (id) {
        const result = await this.$store.dispatch(Types.FETCH_SOURCE_REQUEST, {id});

        if (result) {
          if (result.code === 200) {
            const {projectId, databaseId, sourceName} = result.data;

            this.sourceData = {
              id,
              project_id: projectId,
              database_id: databaseId,
              source_name: sourceName
            };

            if (this.database.sourceType === 'SQL') {
              this.renderCodeMirror();
            }
          } else {
            this.$Message.error('获取信息失败');
          }
        }
      } else {
        this.$store.commit(DatabaseTypes.RESET_DATABASE_TABLES);
        this.sourceData = {
          id: 0,
          project_id: _.parseInt(this.$route.query.pid),
          database_id: _.parseInt(this.$route.query.databaseId),
          source_name: ''
        };
      }
    },
    renderCodeMirror() {
      if (this.codeMirror) {
        return;
      }
      this.codeMirror = codeMirror.fromTextArea(this.$refs.sqlBox, {
        extraKeys: {'Ctrl-Space': 'autocomplete'},
        mode: 'text/x-sql',
        lineWrapping: true,
        lineNumbers: true,
      });
      this.codeMirror.focus();
    },
    toolsClick(args) {
      if (args === 'purview') {
        this.saveBase = false;
        this.purviewData();
      } else if (args === 'rename') {
        this.saveBaseData();
      }
    },
    async purviewData() {
      try {
        if (this.database.sourceType === 'VIEW') {
          await this.checkTables();
          this.$refs.modalDataPurview.show({
            id: this.sourceData.id,
            database_id: this.sourceData.database_id,
            source_type: this.database.sourceType,
            tables: this.database.viewTables,
            relations: this.database.viewRelations,
            distinct: this.database.sourceDistinct
          });
        } else if (this.database.sourceType === 'SQL') {
          const sql = this.codeMirror.doc.getValue();

          this.$store.commit(DatabaseTypes.CHANGE_VIEW_SQL, {sql});
          this.$refs.modalDataPurview.show({
            id: this.sourceData.id,
            database_id: this.sourceData.database_id,
            source_type: this.database.sourceType,
            sql: this.database.sourceSql,
          });
        }
      } catch (error) {
        this.$Message.warning(error.message || error);
      }
    },
    async onSave({columns, distinct}) {
      const {source_name} = this.sourceData;

      if (!source_name) {
        this.saveBase = false;
        this.columns = columns;
        this.distinct = distinct;
        this.$refs.modalSourceEdit.show();
        return;
      }
      this.$Modal.confirm({
        content: '确定提交并保存？',
        onOk: async() => {
          await this.postSave({columns, distinct});
          this.renderData();
        }
      });
    },
    async postSave({columns, distinct}) {
      const result = await this.$store.dispatch(Types.SAVE_SOURCE_REQUEST, {
        ...this.sourceData,
        tables: this.database.viewTables,
        relations: this.database.viewRelations,
        source_type: this.database.sourceType,
        sql: this.database.sourceSql,
        columns,
        distinct,
      });

      if (!result) {
        return;
      }
      if (result.code === 200) {
        this.$Message.success('保存成功');
        this.$router.push({
          name: 'design.source.detail',
          params: {
            id: result.data.id
          },
          query: {
            pid: this.sourceData.project_id
          }
        });
      } else {
        this.$Message.warning(result.message);
      }
    },
    checkTables() {
      if (!this.database.viewTables.length) {
        return Promise.reject('请选择数据表并拖拽到视图中');
      }
      if (this.database.viewTables.length > 1) {
        const unRelationTables = _.filter(this.database.viewTables,
          t => !_.some(this.database.viewRelations, r => r.to && (r.from === t.id || r.to === t.id)));

        if (unRelationTables.length) {
          return Promise.reject(`请添加${_.join(_.map(unRelationTables, t => t.tableName), ',')}的数据关联`);
        }

        const noToTables = _.filter(this.database.viewTables,
          t => _.every(this.database.viewRelations, r => r.to && r.to !== t.id));

        if (!noToTables.length) {
          return Promise.reject('必须存在一个主表');
        } else if (noToTables.length > 1) {
          return Promise.reject('主表数量只能有一个');
        }
      }
      return Promise.resolve();
    },
    saveBaseData() {
      this.saveBase = true;
      this.$refs.modalSourceEdit.show(_.clone(this.sourceData));
    },
    async onNameEdited(sourceData) {
      if (this.saveBase) {
        Object.assign(this.sourceData, sourceData);
        return;
      }
      this.sourceData.source_name = sourceData.source_name;
      await this.onSave({columns: this.columns, distinct: this.distinct});
    },
    onViewTypeChange(sourceType) {
      this.$store.commit(DatabaseTypes.CHANGE_VIEW_TYPE, {sourceType});
      this.$nextTick(() => {
        this.renderCodeMirror();
      });
    }
  },
  components: {...components, ModalSourceEdit},
};
</script>

<style lang="scss">
.source-detail {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: 100%; /* stylelint-disable-line */
  grid-gap: 10px;

  .source-view {
    height: 100%;
  }

  .CodeMirror {/* stylelint-disable-line */
    height: 100%;
  }
}
</style>
