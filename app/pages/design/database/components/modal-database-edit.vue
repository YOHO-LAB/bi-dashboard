<template>
    <i-modal
        class="database-edit"
        title="编辑数据连接"
        :width="600"
        v-model="value">
        <div class="steps">
            <i-steps :current="currentStep" :status="stepError">
                <i-step title="配置" content="配置数据库链接"></i-step>
                <i-step title="测试连接" content="测试数据库连接"></i-step>
                <i-step title="权限" content="分配操作权限"></i-step>
            </i-steps>
        </div>
        <i-form
            v-if="currentStep <= 1"
            class="form-database"
            ref="formDatabase"
            :model="formDatabase"
            :rules="ruleValidate"
            label-position="right" 
            :label-width="90">
            <i-form-item label="名称" prop="db_user">
                <i-input type="text" placeholder="名称" v-model="formDatabase.name"></i-input>
            </i-form-item>
            <i-form-item label="服务器">
                <i-row>
                    <i-col span="16">
                        <i-form-item prop="db_host">
                            <i-input type="text" placeholder="服务器" v-model="formDatabase.db_host"></i-input>
                        </i-form-item>
                    </i-col>
                    <i-col span="7" offset="1">
                        <i-form-item prop="db_port">
                            <i-input type="text" placeholder="端口号" v-model="formDatabase.db_port"></i-input>
                        </i-form-item>
                    </i-col>
                </i-row>
            </i-form-item>
            <i-form-item label="用户名" prop="db_user">
                <i-input type="text" placeholder="用户名" v-model="formDatabase.db_user"></i-input>
            </i-form-item>
            <i-form-item label="密码" prop="db_password">
                <i-input type="password" placeholder="密码" v-model="formDatabase.db_password"></i-input>
            </i-form-item>
            <i-form-item label="数据库版本号" prop="db_version">
                <i-input type="text" placeholder="数据库版本号(非必填)" v-model="formDatabase.db_version"></i-input>
            </i-form-item>
            <i-form-item label="数据库名称" prop="db_name">
                <i-input type="text" placeholder="数据库名称" v-model="formDatabase.db_name"></i-input>
            </i-form-item>
        </i-form>
        <scheme-role-edit ref="schemeRoleEdit" v-if="currentStep === 2" :schemes="schemes"></scheme-role-edit>
        <div slot="footer">
            <i-button type="text" size="large" @click="cancel">取消</i-button>
            <i-button type="primary" size="large" :loading="buttonLoading" @click="next">{{okText}}</i-button>
        </div>
    </i-modal>
</template>

<script>
import _ from 'lodash';
import createApi from 'create-api';
import * as Types from 'store/database/types';
import SchemeRoleEdit from './scheme-role-edit';

export default {
  name: 'ModalDatabaseEdit',
  data() {
    return {
      value: false,
      currentStep: 0,
      stepError: 'wait',
      formDatabase: {
        name: '',
        db_host: '',
        db_port: '5432',
        db_user: '',
        db_password: '',
        db_version: '8.2.15',
        db_name: '',
        id: 0,
      },
      schemes: [],
      ruleValidate: {
        name: [{ required: true, message: '请填写名称'}],
        db_host: [{ required: true, message: '请填写服务器地址'}],
        db_port: [{ required: true, message: '服务器端口号'}],
        db_user: [{ required: true, message: '请填写数据库用户名'}],
        db_password: [{ validator: this.validatorPassword}],
        db_name: [{ required: true, message: '请填写数据库名称'}],
      },
      buttonLoading: false,
      okText: '下一步'
    };
  },
  methods: {
    validatorPassword(rule, value, callback) {
      if (!this.formDatabase.id && !value) {
        return callback(new Error('请填写数据库密码'));
      }
      return callback();
    },
    show(model) {
      this.okText = '下一步';

      this.formDatabase = model || {
        name: '',
        db_host: '',
        db_port: '',
        db_user: '',
        db_password: '',
        db_version: '8.2.15',
        db_name: '',
        id: 0
      };
      this.currentStep = 0;
      this.stepError = 'wait';
      this.buttonLoading = false;

      if (this.$refs.formDatabase) {
        this.$refs.formDatabase.resetFields();
      }
      this.value = true;
    },
    async next() {
      let promise;

      this.stepError = 'wait';

      if (this.currentStep === 0) {
        promise = this.setDatabase();
      } else if (this.currentStep === 1) {
        promise = this.testDatabase();
      } else if (this.currentStep === 2) {
        promise = this.saveDatabase();
      }

      try {
        await promise;
        if (this.currentStep < 2) {
          this.currentStep++;
        }
      } catch (error) {
        console.log(error);
        this.stepError = 'error';
      }
    },
    setDatabase() {
      return new Promise((resolve, reject) => {
        this.$refs.formDatabase.validate(async(valid) => {
          if (valid) {
            resolve();
            this.$nextTick(() => {
              this.next();
            });
          } else {
            reject();
          }
        });
      });
    },
    async testDatabase() {
      this.buttonLoading = true;
      this.okText = '正在测试连接';
      const result = await createApi.post('/database/test', {
        ...this.formDatabase
      });
      let dbResult;

      if (this.formDatabase.id) {
        dbResult = await this.$store.dispatch(Types.FETCH_DATABASE_REQUEST, {id: this.formDatabase.id});
      }

      this.buttonLoading = false;
      this.okText = '保存';

      if (result) {
        if (result.code === 200) {
          this.schemes = _.map(result.data, s => {
            return {
              name: s,
              status: false,
              selected: false,
              roles: []
            };
          });
          if (dbResult && dbResult.code === 200) {
            const {data: {schemes: schemesModel}} = dbResult;

            _.each(this.schemes, s => {
              const findScheme = _.find(schemesModel, sm => sm.schemeName === s.name);

              if (findScheme && findScheme.roles.length) {
                s.status = true;
                s.roles = findScheme.roles;
              }
            });
          }
        } else {
          this.$Message.warning('测试连接失败');
          throw '测试连接失败';
        }
      }
    },
    async saveDatabase() {
      const schemes = this.$refs.schemeRoleEdit.getValues();

      if (!schemes.length) {
        this.$Message.warning('请选择Scheme并配置权限后保存');
        throw '请选择Scheme并配置权限后保存';
      }

      if (_.some(schemes, r => !r.roles.length)) {
        this.$Modal.confirm({
          title: '询问',
          content: '未配置权限的Scheme将不会展示，是否继续保存？',
          closable: true,
          onOk: () => {
            this.postSave();
          }});
      } else {
        this.postSave();
      }
    },
    async postSave() {
      const schemes = this.$refs.schemeRoleEdit.getValues();

      this.buttonLoading = true;
      const result = await createApi.post('/database/save-data', Object.assign(this.formDatabase, {
        schemes
      }));

      this.buttonLoading = false;
      if (result.code === 200) {
        this.$Message.success('保存成功');
        this.value = false;
      } else {
        this.$Message.warning(result.message);
        throw '请选择Scheme并配置权限后保存';
      }
      this.$emit('created');
    },
    cancel() {
      this.value = false;
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
