<template>
    <i-modal class="modal-purview-edit" v-model="showModal" title="编辑权限" :width="modalWidth">
        <i-spin v-if="loading"></i-spin>
        <i-tree v-else ref="purviewTree" :data="purviewData" show-checkbox></i-tree>
        <div slot="footer">
            <i-button type="text" size="large" @click.native="cancel">取消</i-button>
            <i-button type="primary" size="large" :loading="buttonLoading" @click.native="save">保存</i-button>
        </div>
    </i-modal>
</template>

<script>
import _ from 'lodash';
import * as Types from 'store/role/types';
import {mapState} from 'vuex';

export default {
  name: 'ModelPurviewEdit',
  computed: {
    ...mapState(['role'])
  },
  data() {
    return {
      modalWidth: 500,
      showModal: false,
      loading: false,
      buttonLoading: false,
      purviewData: []
    };
  },
  methods: {
    async show(roleId) {
      this.roleId = roleId;
      this.showModal = true;
      this.loading = true;
      this.modalWidth = 500;
      await this.getPurviewsData(roleId);
      this.loading = false;
    },
    async getPurviewsData(roleId) {
      const result = await this.$store.dispatch(Types.FETCH_PURVIEWS_REQUEST, {roleId});

      if (result && result.code === 200) {
        this.purviewData = result.data;
        if (this.purviewData.length - 3 > 0) {
          this.modalWidth += (this.purviewData.length - 3) * 165;
        }
      }
    },
    cancel() {
      this.showModal = false;
    },
    async save() {
      this.buttonLoading = true;
      const purviews = _.map(this.$refs.purviewTree.getCheckedNodes(), node => node.purviewId);

      const result = await this.$store.dispatch(Types.UPDATE_PURVIEW_REQUEST, {roleId: this.roleId, purviews});

      this.buttonLoading = false;
      if (result) {
        if (result.code === 200) {
          this.$Message.success('保存成功');
          this.showModal = false;
        } else {
          this.$Message.warning(result.message);
        }
      }
    }
  }
};
</script>

<style lang="scss">
.modal-purview-edit {
  .ivu-tree {
    display: flex;

    & > .ivu-tree-children {
      margin-right: 20px;
    }
  }

  .ivu-modal-body {
    height: 500px;
    overflow-y: auto;
  }
}
</style>
