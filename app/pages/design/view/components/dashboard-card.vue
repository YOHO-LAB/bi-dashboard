<template>
    <i-card class="flex-card view-dashboard">
        <p slot="title">结果</p>
        <drag-box
            id="view-result"
            :allow="['worksheet']"
            @drag-up="onDropUp">
            <card-dashboard
              :ref="`worksheet${dashboard.worksheet_id}`"
              v-for="(dashboard, index) in view.dashboards"
              :key="dashboard.worksheet_id"
              :title="dashboard.worksheet_name"
              :loading="dashboard.loading"
              :view-type="dashboard.worksheetResultType"
              :worksheet="dashboard"
              @on-filter-change="payload => onFilterChange(dashboard, payload)"
              @on-sort-change="payload => onSortChange(dashboard, payload)">
              <i-dropdown
                slot="extra"
                trigger="click"
                placement="bottom-end"
                class="view-result-dropdown"
                @on-click="name => onDropdownClick(dashboard, name)">
                  <i-icon type="arrow-down-b"></i-icon>
                  <i-dropdown-menu slot="list">
                      <i-dropdown-item name="up" v-if="index > 0">上移</i-dropdown-item>
                      <i-dropdown-item name="down" v-if="index < view.dashboards.length - 1">下移</i-dropdown-item>
                      <i-dropdown-item name="remove">移除</i-dropdown-item>
                  </i-dropdown-menu>
              </i-dropdown>
            </card-dashboard>
        </drag-box>
    </i-card>
</template>
<script>
import _ from 'lodash';
import {mapState} from 'vuex';
import * as Types from 'store/view/types';

export default {
  name: 'DashboardCard',
  computed: {
    ...mapState(['view']),
  },
  props: {
    viewId: Number,
    projectId: Number
  },
  created() {
    this.fetchDashboards(this.viewId);
  },
  methods: {
    async fetchDashboards(viewId) {
      if (!viewId) {
        this.$store.commit(Types.CLEAR_DASHBOARS);
        return;
      }
      const result = await this.$store.dispatch(Types.VIEW_DASHBOARDS_REQUEST, {view_id: viewId});

      if (result) {
        if (result.code === 200) {
          _.each(result.data, worksheet => {
            this.fetchDashboardDetail(worksheet.worksheet_id);
          });
        } else {
          this.$Message.warning(result.message);
        }
      }
    },
    async fetchDashboardDetail(worksheetId, dashboardFilters) {
      const result = await this.$store.dispatch(Types.FETCH_DASHBOARDS_DETAIL, {
        worksheetId,
        filters: dashboardFilters,
        project_id: this.projectId
      });
      const ref = _.first(this.$refs[`worksheet${worksheetId}`]);

      if (result && ref) {
        if (result.code === 200) {
          ref.render(result.data.viewData);
        } else {
          this.$Message.warning(result.message);
        }
      }
    },
    onDropUp({fromValue}) {
      this.$store.commit(Types.APPEND_DASHBOARDS, {order: 0, value: fromValue});
      this.fetchDashboardDetail(fromValue.id);
    },
    onFilterChange(worksheet, filter) {
      this.$store.commit(Types.CHANGE_DASHBOARDS_FILTER, {worksheet, filter});
      this.fetchDashboardDetail(worksheet.worksheet_id, worksheet.filters);
    },
    onSortChange(worksheet, orders) {
      this.$store.commit(Types.CHANGE_DASHBOARDS_SORT, {worksheet, orders});
    },
    onDropdownClick(worksheet, name) {
      switch (name) {
        case 'up':
          this.$store.commit(Types.CHANGE_DASHBOARDS_ORDER, {worksheet, order: worksheet.order - 1});
          break;
        case 'down':
          this.$store.commit(Types.CHANGE_DASHBOARDS_ORDER, {worksheet, order: worksheet.order + 1});
          break;
        default:
          this.$store.commit(Types.DELETE_DASHBOARDS, {worksheet});
          break;
      }
    }
  },
};
</script>

<style lang="scss">
.view-dashboard {
  .result-spin {
    position: absolute;
    z-index: 3;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .view-result-dropdown {
    cursor: pointer;
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
