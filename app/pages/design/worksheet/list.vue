<template>
    <layout-page>
        <i-breadcrumb slot="breadcrumb">
            <i-breadcrumb-item>首页</i-breadcrumb-item>
            <i-breadcrumb-item :to="{name: 'design.project.list'}">项目列表</i-breadcrumb-item>
            <i-breadcrumb-item>工作簿</i-breadcrumb-item>
        </i-breadcrumb>
        <layout-content-card class="worksheet-list-page">
            <p slot="title">{{projectName}}-工作簿</p>
            <card-data
                v-for="worksheet in worksheets"
                :key="worksheet.id"
                @click.native="toWorksheetEdit(worksheet)">
                <p slot="title">{{worksheet.worksheet_name}}</p>
                <p slot="extra">
                    <i-icon type="compose" @click.native.stop="editWorksheet(worksheet)"></i-icon>
                    <i-icon type="close" @click.native.stop="deleteWorksheet(worksheet)"></i-icon>
                </p>
                <div class="purview">
                    <img :src="worksheet.worksheet_purview" alt="">
                </div>
                <p class="time">{{worksheet.created_at}}</p>
            </card-data>
            <card-data :shadow="false" border-style="dashed" @click.native="createWorksheet()">
                <div class="worksheet-plus">
                    <i-icon type="plus"></i-icon>
                </div>
            </card-data>
        </layout-content-card>
        <modal-worksheet ref="onEdited" :auto-save="true" @edited="onEdited"></modal-worksheet>
        <modal-select-source
            ref="modalSelectSource"
            :project-id="projectId"
            @on-select="onSourceSelect">
        </modal-select-source>
    </layout-page>
</template>

<script>
import {
  FETCH_WORKSHEETS_REQUEST,
  SAVE_WORKSHEET_BASE,
} from 'store/worksheet/types';
import {
  LOAD_PROHECT_INFO,
} from 'store/project/types';
import createApi from 'create-api';
import {mapState} from 'vuex';
import ModalWorksheet from './components/modal-worksheet';
import ModalSelectSource from './components/modal-select-source';
import _ from 'lodash';

export default {
  name: 'WorksheetsPage',
  computed: {
    ...mapState(['project', 'worksheet']),
    worksheets() {
      return _.get(this.worksheet.worksheets, `[${this.projectId}]`, []);
    },
    projectName() {
      const project = this.project.projectCaches[this.projectId];

      if (project) {
        return project.project_name;
      }
      return '';
    }
  },
  data() {
    return {
      projectId: _.parseInt(this.$route.params.pid)
    };
  },
  created() {
    this.$store.dispatch(LOAD_PROHECT_INFO, {project_id: this.projectId});
    this.$store.dispatch(FETCH_WORKSHEETS_REQUEST, {project_id: this.projectId});
  },
  methods: {
    editWorksheet(worksheet) {
      this.$refs.onEdited.show(_.clone(worksheet));
    },
    deleteWorksheet(worksheet) {
      this.$Modal.confirm({
        title: '询问',
        content: `确认删除"${worksheet.worksheet_name}"工作簿？`,
        closable: true,
        onOk: async() => {
          const result = await createApi.get('/worksheet/delete-data', {
            id: worksheet.id
          });

          if (result.code === 200) {
            this.$Message.success('删除成功');
            this.$store.dispatch(FETCH_WORKSHEETS_REQUEST, {project_id: this.projectId});
          } else {
            this.$Message.warning(result.message);
          }
        }
      });
    },
    toWorksheetEdit(worksheet) {
      this.$router.push({name: 'design.worksheet.detail', params: {pid: this.projectId, id: worksheet.id}});
    },
    async onEdited({id, worksheet_name}) {
      const result = await this.$store.dispatch(SAVE_WORKSHEET_BASE,
        {
          project_id: this.projectId,
          id,
          worksheet_name
        });

      if (result) {
        if (result.code === 200) {
          this.$Message.success('保存成功');
        } else {
          this.$Message.warning(result.message);
        }
      }
    },
    createWorksheet() {
      this.$refs.modalSelectSource.show();
    },
    onSourceSelect({sourceId}) {
      this.$router.push({
        name: 'design.worksheet.detail',
        params: {
          pid: this.projectId,
          id: 0,
        },
        query: {
          sourceId: sourceId
        }
      });
    }
  },
  components: {ModalWorksheet, ModalSelectSource}
};
</script>

<style lang="scss">
.worksheet-list-page {
  .purview {
    width: 100%;
    height: 100px;

    img {
      max-width: 100%;
      max-height: 100%;
    }
  }

  .time {
    font-size: 12px;
    margin-top: 10px;
    color: #999;
  }

  .worksheet-plus {
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
</style>
