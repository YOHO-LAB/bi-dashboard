<template>
    <i-modal
        class="modal-data-pruview"
        :width="1000"
        v-model="value">
        <p slot="header">
            数据预览
            <i-tooltip placement="right-start">
                <i-icon type="help-circled"></i-icon>
                <div slot="content" class="remark">
                    <div>tips:</div>
                    <div>1.示例数据展示前10条</div>
                    <div>2.点击列名修改字段别名</div>
                    <div>3.勾选复选框隐藏字段</div>
                </div>
            </i-tooltip>
        </p>
        <div class="data-purview-box">
            <div >
                <div class="table-tools">
                    <div class="tool">
                        不显示隐藏字段：<i-switch v-model="hideColumn" size="small" @on-change="onSwitchHide"></i-switch>
                    </div>
                    <div class="tool">
                        去重：<i-switch v-model="distinct" size="small" @on-change="onSwitchDistinct"></i-switch>
                    </div>
                </div>
                <i-spin v-if="loading"></i-spin>
                <i-table v-else :columns="columns" :data="data" :width="950" :height="500"></i-table>
            </div>
        </div>
        <div slot="footer">
            <i-button type="text" size="large" @click="cancel">取消</i-button>
            <i-button type="primary" size="large" @click="save">完成</i-button>
        </div>
        <modal-field-rename ref="modalFieldRename" @edited="onNameEdtied"></modal-field-rename>
    </i-modal>
</template>

<script>
import _ from 'lodash';
import {Checkbox} from 'iview';
import {mapState} from 'vuex';
import {Enums} from 'utils';
import ModalFieldRename from './modal-field-rename';
import * as Types from 'store/source/types';

export default {
  name: 'ModalDataPurview',
  data() {
    return {
      value: false,
      columns: [],
      data: [],
      loading: true,
      hideColumn: false,
      distinct: false
    };
  },
  computed: {
    ...mapState(['database'])
  },
  methods: {
    show({id, database_id, tables, relations, sql, source_type, distinct = false}) {
      Object.assign(this, {
        database_id, tables, relations, sql, source_type, distinct: distinct ? true : false
      });
      this.sourceId = id;
      this.columns = [];
      this.data = [];
      this.value = true;
      this.hideColumn = false;
      this.renderData();
    },
    async renderData() {
      this.loading = true;
      const {database_id, tables, relations, sql, source_type, distinct} = this;
      const result = await this.$store.dispatch(Types.FETCH_SOURCE_DATA_PURVIEW, {
        database_id,
        tables,
        relations,
        sql,
        source_type,
        distinct
      });

      if (result) {
        if (result.code === 200) {
          this.loading = false;
          this.resultData = result.data;
          this.columns = this.joinTableColumns(true);
          this.data = this.resultData.data;
        } else {
          this.$Message.warning(result.message);
          this.cancel();
        }
      }
    },
    getHeaderBg(alias) {
      if (!this.tables || this.tables.length <= 1) {
        return void 0;
      }
      return Enums.TABLE_ALIAS_COLOR[_.findIndex(Enums.TABLE_ALIAS_DICTS, d => d === alias)];
    },
    getSourceCol(col) {
      return _.find(this.database.viewResultColumns, c => {
        return c.tableAlias === col.tableAlias &&
                    c.title === col.title &&
                    c.schemeName === col.schemeName;
      });
    },
    joinTableColumns(init) {
      const {columns, data} = this.resultData;
      const tableColumns = [];

      if (data.length) {
        _.each(columns, (table, tableKey) => {
          _.each(table, (col, colKey) => {
            if (typeof col.hide === 'undefined') {
              col.hide = false;
            }
            if (this.sourceId && init) {
              const sourceCol = this.getSourceCol(col);

              if (sourceCol) {
                col.hide = sourceCol.hide;
                col.alias = sourceCol.alias;
              }
            }
            if (col.hide && this.hideColumn) {
              return;
            }
            tableColumns.push({
              colKey: `${tableKey}.${colKey}`,
              width: 150,
              hide: col.hide,
                            renderHeader: (h, {column}) => { //eslint-disable-line
                return (
                  <div class={{hide: column.hide, 'col-header': true}} style={{'background-color': this.getHeaderBg(tableKey)}}>
                    <p class="col-title" title={col.title}>
                      <Checkbox key={colKey} indeterminate={column.hide} value={column.hide} class="col-hide" onInput={val => {
                        col.hide = column.hide = val;
                      }}></Checkbox>
                      <span onClick={() => (this.editAlias(col))}>
                        {col.alias || col.title}
                      </span>
                    </p>
                    {col.tableName ?
                      (<p class="col-table-name" title={`${col.tableName}[${col.schemeName}]`}>
                        {col.tableName}[{col.schemeName}]
                      </p>) :
                      void 0}
                  </div>
                );
              },
              render: (h, {row, column}) => {
                return (
                  <div class={{hide: column.hide, 'col-cell': true}}>
                    {_.get(row, column.colKey)}
                  </div>
                );
              }
            });
          });
        });
      }
      tableColumns.push({});
      return tableColumns;
    },
    save() {
      const columns = _.flatten(_.map(this.resultData.columns, t => {
        return _.map(t, col => col);
      }));

      this.$emit('on-save', {columns, distinct: this.distinct});
      this.value = false;
    },
    cancel() {
      this.value = false;
    },
    editAlias(col) {
      this.$refs.modalFieldRename.show(col);
    },
    onNameEdtied({col, name}) {
      col.alias = name;
      this.refresh();
    },
    refresh() {
      this.columns = this.joinTableColumns();
    },
    onSwitchHide(hide) {
      this.hideColumn = hide;
      this.refresh();
    },
    onSwitchDistinct(distinct) {
      this.distinct = distinct;
      this.renderData();
    }
  },
  components: {Checkbox, ModalFieldRename}
};
</script>

<style lang="scss">
.modal-data-pruview {
  .ivu-table-cell {
    padding: 0;
    width: 100%;
    height: 48px;

    .hide {
      background-color: #eee;
      color: #999;
    }
  }

  .col-cell {
    padding-left: 10px;
    padding-right: 10px;
    width: 100%;
    height: 48px;
    line-height: 48px;
  }

  .col-header {
    height: 48px;
    padding-top: 5px;
    overflow: hidden;
    padding-left: 10px;
    padding-right: 10px;

    .ivu-checkbox-checked {
      .ivu-checkbox-inner {
        background-color: #ed3f14;
        border-color: #ed3f14;
      }
    }
  }

  .col-title {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    cursor: pointer;
  }

  .col-table-name {
    font-size: 12px;
    color: #999;
    font-weight: normal;
    transform: scale(0.8);
    transform-origin: left;
    text-shadow: 1px 1px 1px #fff;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .table-tools {
    padding-bottom: 10px;

    .tool {
      display: inline-block;
      margin-right: 10px;
    }
  }
}
</style>
