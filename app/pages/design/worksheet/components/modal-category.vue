<template>
    <i-modal
        class="modal-category"
        title="创建分层结构"
        :width="500"
        v-model="modalShow"
        @on-visible-change="visibleChange">
        <i-input class="inp-title" v-model="name" placeholder="请填写分层结构名称"></i-input>
        <div slot="footer">
            <i-button type="text" size="large" @click.native="cancel">取消</i-button>
            <i-button type="primary" size="large" :loading="buttonLoading" @click.native="save">保存</i-button>
        </div>
    </i-modal>  
</template>

<script>
export default {
  name: 'ModalCategory',
  data() {
    return {
      buttonLoading: false,
      modalShow: false,
      name: ''
    };
  },
  methods: {
    visibleChange(visible) {
      if (!visible) {
        this.reset();
      }
    },
    reset() {
      this.name = '';
    },
    cancel() {
      this.modalShow = false;
    },
    show(name, data) {
      this.modalShow = true;
      this.name = name;
      this.data = data;
    },
    save() {
      if (!this.name) {
        this.$Message.warning('请填写分层结构名称');
        return;
      }
      this.modalShow = false;
      this.$emit('on-save', {name: this.name, data: this.data});
    }
  }
};
</script>

<style>

</style>
