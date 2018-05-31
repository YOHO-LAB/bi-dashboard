<template>
    <i-modal
        width="500"
        title="选择角色"
        v-model="isShow">
        <div class="modal-viewrole-content">
            <checkbox-role @on-change="changeRole" :roles="curRoles"></checkbox-role>
        </div>
        <div slot="footer">
            <i-button type="text" size="large" @click.native="cancel">取消</i-button>
            <i-button type="primary" size="large" @click.native="save">保存</i-button>
        </div>
    </i-modal>
</template>

<script>
import createApi from 'create-api';

export default {
  name: 'ModalRoles',
  data() {
    return {
      isShow: false,
      curRoles: []
    };
  },
  props: {
    viewId: Number
  },
  methods: {
    show(roles) {
      this.curRoles = roles || [];
      this.isShow = true;
    },
    cancel() {
      this.isShow = false;
    },
    changeRole(roles) {
      this.curRoles = roles;
    },
    async save() {
      const params = [];

      if (this.curRoles.length < 1) {
        this.$Message.warning('请选择角色');
        return;
      }

      this.isShow = false;

      this.curRoles.map(item => {
        return params.push({
          view_id: this.viewId,
          role_id: item
        });
      });

      const {data} = await createApi.post('/view/role-publish', params);

      if (data) {
        this.$emit('save');
      } else {
        this.$Message.warning('选择角色，请稍后在试...');
      }
    }
  }
};
</script>

<style lang="scss">
.modal-viewrole-content {
  min-height: 200px;
}
</style>
