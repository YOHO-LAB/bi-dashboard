<template>
    <layout-page>
        <div slot="tools">
            <i-dropdown placement="bottom-start" trigger="click" @on-click="toolsClick">
                <span class="title">工作簿</span>
                <i-dropdown-menu slot="list">
                    <i-dropdown-item name="save">保存</i-dropdown-item>
                    <i-dropdown-item name="output">导出</i-dropdown-item>
                    <i-dropdown-item name="rename">重命名</i-dropdown-item>
                </i-dropdown-menu>
            </i-dropdown>
            <i-dropdown placement="bottom-start" trigger="click" @on-click="toolsClick">
                <span class="title">编辑</span>
                <i-dropdown-menu slot="list">
                    <i-dropdown-item name="revert" :disabled="disableHistoryRevert">还原</i-dropdown-item>
                    <i-dropdown-item name="back" :disabled="disableHistoryBack">撤销</i-dropdown-item>
                    <i-dropdown-item name="forword" :disabled="disableHistoryForword">前进</i-dropdown-item>
                </i-dropdown-menu>
            </i-dropdown>
            <i-dropdown placement="bottom-start" trigger="click" @on-click="toolsClick">
                <span class="title">图表</span>
                <i-dropdown-menu slot="list">
                    <i-dropdown placement="right-start">
                        <i-dropdown-item>
                            图表切换
                            <i-icon type="ios-arrow-right"></i-icon>
                        </i-dropdown-item>
                        <i-dropdown-menu slot="list">
                            <i-dropdown-item
                                v-for="t in GETTER_RESULT_TYPES"
                                :key="t.type"
                                :name="`result-switch:${t.type}`">{{t.label}}</i-dropdown-item>
                        </i-dropdown-menu>
                    </i-dropdown>
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
                :to="{name: 'design.worksheet.list', params: {pid: currentProject.id}}">
                {{currentProject.project_name}}
            </i-breadcrumb-item>
            <i-breadcrumb-item v-if="worksheetId">{{worksheetName}}</i-breadcrumb-item>
            <i-breadcrumb-item v-else>新建工作簿</i-breadcrumb-item>
        </i-breadcrumb>
        <div class="worksheet-detail">
            <div class="detail-spin" v-if="worksheet.saveingWorksheet">
                <i-spin size="large"></i-spin>
            </div>
            <dimension-card class="dimension" @on-change="onWorksheetChange"></dimension-card>
            <measure-card class="measure" @on-change="onWorksheetChange"></measure-card>
            <filter-card class="filter" @on-change="onWorksheetChange"></filter-card>
            <value-card class="value" @on-change="onWorksheetChange"></value-card>
            <cr-card class="cr" @on-change="onWorksheetChange"></cr-card>
            <result-card
              ref="resultCard"
              class="result"
              @on-filter-change="onWorksheetChange"></result-card>
        </div>
        <modal-worksheet ref="worksheetEdit" @edited="worksheetEdit"></modal-worksheet>
    </layout-page>
</template>

<script>
import * as Types from 'store/worksheet/types';
import {
  LOAD_PROHECT_INFO,
} from 'store/project/types';
import _ from 'lodash';
import {mapState, mapGetters} from 'vuex';
import components from './components';
import {BlobUtil} from 'utils';


export default {
  name: 'WorkSheetDetailPage',
  computed: {
    ...mapState(['worksheet', 'project']),
    ...mapGetters([Types.GETTER_RESULT_TYPES]),
    currentProject() {
      const project = this.project.projectCaches[this.projectId];

      if (project) {
        return project;
      }
      return '';
    },
    disableHistoryBack() {
      const {currentIndex, startIndex} = this.worksheet.history;

      return currentIndex === void 0 || currentIndex <= startIndex;
    },
    disableHistoryForword() {
      const {currentIndex, historyLength} = this.worksheet.history;

      return currentIndex === void 0 || currentIndex >= historyLength - 1;
    },
    disableHistoryRevert() {
      const {currentIndex, baseIndex, startIndex} = this.worksheet.history;

      return currentIndex === void 0 || startIndex > baseIndex || baseIndex === currentIndex;
    }
  },
  data() {
    return {
      saveBase: false,
      projectId: 0,
      worksheetId: 0,
      worksheetName: '',
      sourceId: 0,
      viewData: {}
    };
  },
  async created() {
    const {id, pid} = this.$route.params;
    const {sourceId} = this.$route.query;

    this.projectId = _.parseInt(pid);
    this.worksheetId = _.parseInt(id);
    this.sourceId = _.parseInt(sourceId);
    this.$store.commit(Types.RESET_WORKSHEET_DATA);
    this.$store.dispatch(LOAD_PROHECT_INFO, {project_id: pid});
    if (id > 0) {
      const worksheet = await this.$store.dispatch(Types.FETCH_WORKSHEET_REQUEST, {id: this.worksheetId});

      if (worksheet) {
        this.fetchResultData();
        this.worksheetName = worksheet.worksheet_name;
      }
    } else if (pid) {
      await this.$store.dispatch(Types.FETCH_WORKSHEET_FIELDS_REQUEST, {sourceId: this.sourceId});
    }
    if (this.worksheet.history.baseIndex !== this.worksheet.history.currentIndex) {
      this.showCacheLoging();
    }
  },
  methods: {
    async fetchResultData() {
      const result = await this.$store.dispatch(Types.FETCH_DATA_REQUEST);

      if (result && this.$refs.resultCard) {
        if (result.code === 200) {
          this.$refs.resultCard.render(result.data);
        } else {
          this.$Message.warning(result.message);
        }
      }
    },
    onWorksheetChange() {
      this.fetchResultData();
    },
    showCacheLoging() {
      this.$Message.info({
        duration: 5,
        onClose() {
          this.$store.commit(Types.CLEAR_LOCAL_WORKSHEET);
        },
        render: h => {
          return h('div', {
            class: {
              'cache-message': true
            }
          }, [
            '检测未保存的数据是否加载?',
            h('i-button', {
              props: {
                type: 'warning',
                size: 'small'
              },
              on: {
                click: this.loadCache
              }
            }, '加载'),
            h('i-button', {
              props: {
                size: 'small'
              },
              on: {
                click: this.cancelCache
              }
            }, '取消')
          ]);
        }
      });
    },
    loadCache() {
      this.$Message.destroy();
      this.$store.commit(Types.LOAD_LOCAL_WORKSHEET);
      this.fetchResultData();
    },
    cancelCache() {
      this.$Message.destroy();
      this.$store.commit(Types.CLEAR_LOCAL_WORKSHEET);
    },
    async toolsClick(args) {
      if (args === 'save') {
        this.saveBase = false;
        this.saveData();
      } else if (args === 'rename') {
        this.saveBaseData();
      } else if (args === 'output') {
        if (this.worksheet.worksheetResultType !== 'table') {
          const dataUrl = await this.$refs.resultCard.capture();

          return BlobUtil.downloadBlob(BlobUtil.dataURL2Blob(dataUrl),
            `${this.worksheetName}`);
        }
        this.$Loading.start();
        const blobData = await this.$store.dispatch(Types.OUTPUT_WORKSHEET_DATA_REQUEST, {
          id: this.worksheetId,
          source_id: this.sourceId,
        });

        this.$Loading.finish();
        if (blobData instanceof Blob) {
          BlobUtil.downloadBlob(blobData, `${this.worksheetName}.xlsx`);
        } else if (blobData && blobData.code !== 200) {
          this.$Message.warning(blobData.message);
        }

      } else if (args === 'revert' && !this.disableHistoryRevert) {
        this.toolsRevert();
      } else if (args === 'back' && !this.disableHistoryBack) {
        this.toolsBack();
      } else if (args === 'forword' && !this.disableHistoryForword) {
        this.toolsForword();
      } else if (args && args.indexOf('result-switch:') === 0) {
        const type = args.match(/result-switch:(.*)$/)[1];

        this.$store.commit(Types.SWITCH_RESULT_TYPE, {type});
      }
    },
    toolsRevert() {
      this.$store.commit(Types.HISTORY_REVERT);
      this.fetchResultData();
    },
    toolsBack() {
      this.$store.commit(Types.HISTORY_BACK);
      this.fetchResultData();
    },
    toolsForword() {
      this.$store.commit(Types.HISTORY_FORWORD);
      this.fetchResultData();
    },
    async saveData() {
      if (!this.worksheetName) {
        this.saveBase = false;
        this.$refs.worksheetEdit.show();
        return;
      }

      if (!this.projectId) {
        this.$Message.warning('请选择项目');
        return;
      }
      this.$store.commit(Types.SAVE_WORKSHEET_DATA_REQUEST);
      const capture = await this.$refs.resultCard.capture();

      const result = await this.$store.dispatch(Types.SAVE_WORKSHEET_DATA_REQUEST, {
        project_id: this.projectId,
        worksheet_name: this.worksheetName,
        id: this.worksheetId,
        source_id: this.sourceId,
        purview_img: capture
      });

      if (result) {
        if (result.code === 200) {
          this.$Message.success('保存成功');
          this.worksheetId = result.data.id;
          this.$router.push({name: 'design.worksheet.detail', params: {pid: this.projectId, id: result.data.id}});
        } else {
          this.$Message.warning(result.message);
        }
      }
    },
    saveBaseData() {
      this.saveBase = true;
      this.$refs.worksheetEdit.show({id: this.worksheetId, worksheet_name: this.worksheetName});
    },
    async worksheetEdit({worksheet_name}) {
      this.worksheetName = worksheet_name;
      await this.saveData();
    }
  },
  beforeRouteLeave(to, from, next) {
    if (this.worksheet.history.baseIndex !== this.worksheet.history.currentIndex) {
      this.$Modal.confirm({
        title: '询问',
        content: '检测到未保存的数据，确认离开页面？',
        onOk: () => {
          this.$store.commit(Types.CLEAR_LOCAL_WORKSHEET);
          next();
        },
        onCancel() {
          next(false);
        }
      });
    } else {
      this.$store.commit(Types.CLEAR_LOCAL_WORKSHEET);
      return next();
    }
  },
  components: {...components},
};
</script>

<style lang="scss">
.cache-message {
  .ivu-btn {
    margin-left: 5px;
  }
}

.worksheet-detail {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 230px 220px 1fr;
  grid-template-rows: 1fr 1fr 1fr 50%;
  /* stylelint-disable */
  grid-template-areas:
    "dimension filter cr"
    "dimension filter result"
    "dimension value result"
    "measure value result";
  /* stylelint-enable */
  grid-gap: 10px;

  .field-item {
    .drop-down-box {
      padding-left: 5px;
    }
  }

  .detail-spin {
    position: absolute;
    z-index: 3;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .dimension {
    grid-area: dimension;
  }

  .measure {
    grid-area: measure;
  }

  .filter {
    grid-area: filter;
  }

  .value {
    grid-area: value;
  }

  .cr {
    grid-area: cr;
  }

  .result {
    grid-area: result;
  }
}

.ivu-card-body {
  padding: 10px;
}
</style>
