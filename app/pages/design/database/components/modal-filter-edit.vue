<template>
    <i-modal
        class="database-edit"
        title="编辑数据过滤"
        :width="600"
        v-model="showValue"
        @on-visible-change="onVisibleChange">
        <i-form
            class="form-database"
            ref="formDatabase"
            :model="formDatabase"
            :rules="ruleValidate"
            label-position="right" 
            :label-width="90">
            <i-form-item label="名称" prop="filterName">
                <i-input type="text" placeholder="名称" v-model="formDatabase.filterName"></i-input>
            </i-form-item>
            <i-form-item label="Scheme" prop="databaseSchemeId">
                <i-select v-if="schemes.length" v-model="formDatabase.databaseSchemeId" @on-change="onSchemeChange">
                    <i-option v-for="scheme in schemes" :key="scheme.id" :value="scheme.id">
                        {{scheme.name}}
                    </i-option>
                </i-select>
            </i-form-item>
            <i-form-item label="Table" prop="tableName">
                <i-select v-if="tables.length" v-model="formDatabase.tableName" @on-change="onTableChange">
                    <i-option v-for="table in tables" :key="table.tableName" :value="table.tableName">
                        {{table.tableName}}
                    </i-option>
                </i-select>
            </i-form-item>
            <i-form-item label="Column" prop="fieldName">
                <i-select v-if="columns.length" v-model="formDatabase.fieldName">
                    <i-option v-for="column in columns" :key="column.title" :value="column.title">
                        {{column.title}}
                    </i-option>
                </i-select>
            </i-form-item>
            <i-form-item label="过滤值类型" prop="db_version">
                <i-radio-group v-model="formDatabase.filterParamType">
                    <i-radio label="number">数值</i-radio>
                    <i-radio label="string">字符</i-radio>
                    <i-radio label="array">数组(数值)</i-radio>
                </i-radio-group>
            </i-form-item>
            <i-form-item label="条件表达式" prop="filterCondition">
                <i-input type="text" placeholder="例如：$column in ($value)或$column = $value等" v-model="formDatabase.filterCondition"></i-input>
            </i-form-item>
        </i-form>
        <div slot="footer">
            <i-button type="text" size="large" @click="cancel">取消</i-button>
            <i-button type="primary" size="large" :loading="buttonLoading" @click="onClickSave">保存</i-button>
        </div>
    </i-modal>
</template>

<script>
import _ from 'lodash';
import * as Types from 'store/database/types';
import SchemeRoleEdit from './scheme-role-edit';

export default {
  name: 'ModalFilterEdit',
  data() {
    return {
      showValue: false,
      formDatabase: {
        filterName: '',
        databaseId: 0,
        databaseSchemeId: 0,
        tableName: '',
        fieldName: '',
        filterParamType: '',
        filterCondition: '',
        id: 0,
      },
      schemes: [],
      tables: [],
      columns: [],
      ruleValidate: {
        filterName: [{ required: true, message: '请填写名称'}],
        databaseSchemeId: [{ required: true, message: '请选择scheme'}],
        tableName: [{ required: true, message: '请填写表名'}],
        fieldName: [{ required: true, message: '请填写字段名'}],
        filterParamType: [{ required: true, message: '请选择值类型'}],
        filterCondition: [{ required: true, message: '请填写条件表达式'}],
      },
      buttonLoading: false,
    };
  },
  methods: {
    async show({model, databaseId}) {
      this.showValue = true;
      if (databaseId) {
        this.formDatabase.databaseId = databaseId;
      }
      if (model) {
        this.formDatabase = _.clone(model);
      }

      if (this.$refs.formDatabase) {
        this.$refs.formDatabase.resetFields();
      }
      await this.render({model, databaseId});
    },
    async render({model, databaseId}) {
      if (model) {
        return await Promise.all([
          this.renderSchemes(model.databaseId),
          this.renderTables(model.databaseSchemeId),
          this.renderColumns({schemeId: model.databaseSchemeId, tableName: model.tableName}),
        ]);
      } else {
        return await this.renderSchemes(databaseId);
      }
    },
    reset() {
      this.formDatabase = {
        filterName: '',
        databaseId: 0,
        databaseSchemeId: 0,
        tableName: '',
        fieldName: '',
        filterParamType: '',
        filterCondition: '',
        id: 0,
      };
      this.buttonLoading = false;
      this.tables = [];
      this.schemes = [];
      this.columns = [];
    },
    async renderSchemes(databaseId) {
      const result = await this.$store.dispatch(Types.FETCH_SCHEMES_REQUEST, {databaseId});

      if (result && result.code === 200) {
        this.schemes = result.data;
      }
    },
    async renderTables(schemeId) {
      const result = await this.$store.dispatch(Types.FETCH_TABLES_REQUEST, {schemeId});

      if (result && result.code === 200) {
        this.tables = result.data;
      }
    },
    async renderColumns({schemeId, tableName}) {
      const result = await this.$store.dispatch(Types.FETCH_COLUMNS_REQUEST, {schemeId, tableName});

      if (result && result.code === 200) {
        this.columns = result.data.columns;
      }
    },
    onSchemeChange(schemeId) {
      if (schemeId) {
        this.tables = [];
        this.renderTables(schemeId);
      }
    },
    onTableChange(tableName) {
      if (tableName && this.formDatabase.databaseSchemeId) {
        this.columns = [];
        this.renderColumns({schemeId: this.formDatabase.databaseSchemeId, tableName});
      }
    },
    async onClickSave() {
      this.$refs.formDatabase.validate(async(valid) => {
        if (!valid) {
          return;
        }
        this.buttonLoading = true;
        const result = await this.$store.dispatch(Types.SAVE_DATABASE_FILTER, this.formDatabase);

        this.buttonLoading = false;
        if (result) {
          if (result.code === 200) {
            this.$emit('on-filter-edited', result.data);
            this.showValue = false;
          } else {
            this.$Message.warning(result.message);
          }
        }

      });
    },
    onVisibleChange(show) {
      if (!show) {
        this.cancel();
      }
    },
    cancel() {
      this.showValue = false;
      this.reset();
    }
  },
  components: {SchemeRoleEdit}
};
</script>

<style lang="scss">
.database-edit {
  .ivu-col {
    padding: 0;
  }

  .steps {
    width: 90%;
    margin: 0 auto;
    margin-bottom: 40px;
  }

  .form-database {
    width: 70%;
    margin: 0 auto;
  }
}
</style>
