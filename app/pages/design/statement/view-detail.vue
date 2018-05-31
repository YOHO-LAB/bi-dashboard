<template>
    <layout-page class="statement-detail" :gap="0">
        <i-breadcrumb slot="breadcrumb">
            <i-breadcrumb-item>首页</i-breadcrumb-item>
            <i-breadcrumb-item>报表</i-breadcrumb-item>
            <i-breadcrumb-item>{{projectName}}</i-breadcrumb-item>
            <i-breadcrumb-item>{{viewName}}</i-breadcrumb-item>
        </i-breadcrumb>
        <div class="statement-detail-content">
          <card-dashboard
            :ref="`worksheet${dashboard.worksheet_id}`"
            v-for="dashboard in dashboards"
            :key="dashboard.worksheet_id"
            :title="dashboard.worksheet_name"
            :loading="dashboard.loading"
            :view-type="dashboard.worksheetResultType"
            :worksheet="dashboard"
            @on-filter-change="payload => onFilterChange(dashboard, payload)"
            @on-sort-change="payload => onSortChange(dashboard, payload)">
            <i-button slot="extra" type="primary" @click="onOutputDashboard(dashboard)" :loading="outputWorksheetId === dashboard.worksheet_id">
              导出
            </i-button>
          </card-dashboard>
        </div>
    </layout-page>
</template>

<script>
import _ from 'lodash';
import {mapState} from 'vuex';
import {BlobUtil} from 'utils';
import * as Types from 'store/statement/types';

export default {
  name: 'SourceDetail',
  computed: {
    ...mapState(['statement'])
  },
  data() {
    return {
      projectName: '',
      viewId: this.$route.params.id,
      viewName: '',
      dashboards: [],
      outputWorksheetId: 0
    };
  },
  async created() {
    const {id} = this.$route.params;

    this.fetchData(id);
    this.fetchDashboards(id);
  },
  methods: {
    async fetchData(viewId) {
      let result = await this.$store.dispatch(Types.STATEMENT_DATA_REQUEST, {view_id: viewId});

      if (result) {
        if (result.code === 200) {
          this.projectName = result.data.project_name;
          this.viewName = result.data.view_name;
        } else {
          this.$Message.warning(result.message);
        }
      }
    },
    async fetchDashboards(viewId) {
      if (!viewId) {
        return;
      }
      const result = await this.$store.dispatch(Types.STATEMENT_FETCH_DASHBOARDS, {view_id: viewId});

      if (result) {
        if (result.code === 200) {
          this.dashboards = _.map(_.orderBy(result.data, ['order']), d => {
            return Object.assign(d, {
              loading: true
            });
          });
          _.each(result.data, worksheet => {
            this.fetchDashboardDetail(worksheet.worksheet_id);
          });
        } else {
          this.$Message.warning(result.message);
        }
      }
    },
    async fetchDashboardDetail(worksheetId, dashboardFilters) {
      const result = await this.$store.dispatch(Types.STATEMENT_FETCH_DASHBOARDS_DETAIL, {
        worksheetId,
        filters: dashboardFilters,
        view_id: this.viewId
      });
      const ref = _.first(this.$refs[`worksheet${worksheetId}`]);

      if (result && ref) {
        if (result.code === 200) {
          const find = _.find(this.dashboards, d => d.worksheet_id === worksheetId);

          if (find) {
            const {rows, values, columns, filters, orders, viewData} = result.data;

            Object.assign(find, {
              rows,
              values,
              columns,
              filters,
              orders,
              loading: false
            });
            ref.render(viewData);
          }
        } else {
          this.$Message.warning(result.message);
        }
      }
    },
    onFilterChange(worksheet, filter) {
      const findFilter = _.find(worksheet.filters, f => f.title === filter.value.title);

      findFilter.val = filter.val;
      worksheet.loading = true;
      this.fetchDashboardDetail(worksheet.worksheet_id, worksheet.filters);
    },
    onSortChange(worksheet, orders) {
      worksheet.orders = orders;
    },
    async onOutputDashboard({worksheet_id, worksheet_name, filters}) {
      let worksheetData = _.find(this.dashboards, {worksheet_id});

      if (worksheetData.worksheetResultType !== 'table') {
        const dataUrl = await _.first(this.$refs[`worksheet${worksheet_id}`]).capture();

        return BlobUtil.downloadBlob(BlobUtil.dataURL2Blob(dataUrl),
          `${worksheetData.worksheet_name}`);
      }
      this.outputWorksheetId = worksheet_id;
      const blobData = await this.$store.dispatch(Types.STATEMENT_OUTPUT_DASHBOARD_REQUEST, {
        worksheetId: worksheet_id,
        view_id: this.$route.params.id,
        filters
      });

      this.outputWorksheetId = 0;

      if (blobData instanceof Blob) {
        BlobUtil.downloadBlob(blobData, `${worksheet_name}.xlsx`);
      } else if (blobData && blobData.code !== 200) {
        this.$Message.warning(blobData.message);
      }
    },
  },
};
</script>

<style lang="scss">
.statement-detail {
  .statement-detail-content {
    padding-left: 20px;
    padding-right: 20px;
    overflow-y: auto;
    height: 100%;
  }

  .card-dashboard {
    margin-bottom: 20px;
    min-height: 400px;
  }

  .result-chart {
    height: 400px !important;
  }
}
</style>

