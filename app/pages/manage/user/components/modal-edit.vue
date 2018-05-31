<template>
    <i-modal v-model="showModal" title="编辑">
        <i-form :label-width="80" ref="formInline" :model="model" :rules="ruleInline">
            <i-form-item label="用户名" prop="userName">
              <i-input v-if="authType === 'account' && !uid" type="text" placeholder="请输入用户名" v-model="model.userName" name="user-edit-username"></i-input>
              <span v-else>{{model.userName}}</span>
            </i-form-item>
            <i-form-item label="密码" prop="userPwd" v-if="authType === 'account'">
              <input type="hidden" name="pwd" id="">
              <i-input type="password" name="pwd" placeholder="请输入密码" v-model="model.userPwd"></i-input>
            </i-form-item>
            <i-form-item label="姓名" prop="realName">
              <i-input v-if="authType === 'account'" type="text" placeholder="请输入姓名" v-model="model.realName"></i-input>
              <span v-else>{{model.realName}}</span>
            </i-form-item>
            <i-form-item label="角色" prop="roleId">
                <select-role v-model="model.roleId" style="width: 200px;"></select-role>
            </i-form-item>
            <i-form-item label="邮箱" prop="email">
              <i-input v-if="authType === 'account'" type="text" placeholder="请输入姓名" v-model="model.email"></i-input>
              <span v-else>{{model.email}}</span>
            </i-form-item>
            <i-form-item label="状态" prop="status">
                <i-switch v-if="authType === 'account'" size="large"
                  :value="model.status === 1 ? true : false"
                  @input="val => (model.status = val ? 1 : 0)">
                  <span slot="open">启用</span>
                  <span slot="close">禁用</span>
                </i-switch>
                <span v-else>{{model.status === 1 ? '启用' : '禁用'}}</span>
            </i-form-item>
        </i-form>
        <div slot="footer">
            <i-button type="text" size="large" @click.native="cancel">取消</i-button>
            <i-button type="primary" size="large" :loading="buttonLoading" @click="save">保存</i-button>
        </div>
    </i-modal>
</template>

<script>
import config from 'config';
import * as Types from 'store/user/types';
import {mapState} from 'vuex';

export default {
  name: 'UserEdit',
  computed: {
    ...mapState(['user'])
  },
  data() {
    return {
      uid: 0,
      showModal: false,
      authType: '',
      model: {},
      buttonLoading: false,
      ruleInline: {
        userName: [{ required: true, min: 5, max: 20, message: '请填写5-20位用户名', trigger: 'blur' }],
        realName: [{ required: true, min: 1, max: 20, message: '请填写1-20位姓名', trigger: 'blur' }],
        roleId: [{ required: true, type: 'number', message: '请选择角色', trigger: 'blur' }],
        email: [{ required: true, type: 'email', message: '请填写邮箱', trigger: 'blur' }],
      }
    };
  },
  created() {
    this.authType = config.authType;
  },
  methods: {
    show({id, roleId = '', status = 1, realName, userName, email} = {}) {
      this.uid = id;
      this.model = {
        userName,
        realName,
        roleId,
        status,
        email
      };
      this.showModal = true;
    },
    cancel() {
      this.showModal = false;
    },
    async save() {
      this.$refs.formInline.validate((valid) => {
        if (valid) {
          this.postSave();
        } else {
          this.$Message.error('表单验证失败!');
          this.failNum++;
        }
      });
    },
    async postSave() {
      this.buttonLoading = true;
      const result = await this.$store.dispatch(Types.UPDATE_USER_REQUEST, Object.assign({
        uid: this.uid,
      }, this.model));

      this.buttonLoading = false;

      if (result) {
        if (result.code === 200) {
          this.$store.dispatch(Types.FETCH_USERS_REQUEST, {});
          this.$Message.success('修改成功');
          this.showModal = false;
        } else {
          this.$Message.warning(result.message);
        }
      }
    }
  },
};
</script>

<style>

</style>
