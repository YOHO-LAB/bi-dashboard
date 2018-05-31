<template>
    <i-modal
        class="rename-edit"
        title="重命名"
        :width="400"
        v-model="value">
        <i-form ref="formModel" :model="formModel" :rules="ruleValidate" label-position="right" :label-width="90">
            <i-form-item label="名称" prop="name">
                <i-input type="text" placeholder="名称" v-model="formModel.name"></i-input>
            </i-form-item>
        </i-form>
        <div slot="footer">
            <i-button type="text" size="large" @click.native="cancel">取消</i-button>
            <i-button type="primary" size="large" @click.native="save">保存</i-button>
        </div>
    </i-modal>
</template>

<script>
export default {
  name: 'ModalFieldRename',
  data() {
    return {
      value: false,
      formModel: {
        name: '',
      },
      ruleValidate: {
        name: [{ required: true, message: '请填写名称'}],
      }
    };
  },
  methods: {
    show(col) {
      this.$refs.formModel.resetFields();
      this.formModel.name = col.alias || col.title;
      this.col = col;
      this.value = true;
    },
    save() {
      this.$refs.formModel.validate(async(valid) => {
        if (valid) {
          this.$emit('edited', Object.assign({col: this.col}, this.formModel));
          this.value = false;
        }
      });
    },
    cancel() {
      this.value = false;
    }
  }
};
</script>

<style lang="scss">
.rename-edit {
  .ivu-modal-mask,
  .ivu-modal-wrap {
    z-index: 1001;
  }
}
</style>
