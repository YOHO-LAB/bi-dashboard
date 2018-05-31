<template>
    <i-modal
        class="project-edit"
        title="编辑工作簿"
        :width="400"
        v-model="value">
        <i-form ref="formWorksheet" :model="formWorksheet" :rules="ruleValidate" label-position="right" :label-width="90">
            <i-form-item label="工作簿名称" prop="worksheet_name">
                <i-input type="text" placeholder="工作簿名称" v-model="formWorksheet.worksheet_name"></i-input>
            </i-form-item>
        </i-form>
        <div slot="footer">
            <i-button type="text" size="large" @click.native="cancel">取消</i-button>
            <i-button type="primary" size="large" :loading="buttonLoading" @click.native="save">保存</i-button>
        </div>
    </i-modal>
</template>

<script>
export default {
  name: 'ModalWorksheet',
  props: {
    autoSave: Boolean
  },
  data() {
    return {
      value: false,
      formWorksheet: {
        worksheet_name: '',
        id: 0
      },
      ruleValidate: {
        worksheet_name: [{ required: true, message: '请填写工作簿名称'}],
      },
      buttonLoading: false,
    };
  },
  methods: {
    show(model) {
      this.formWorksheet = model || {
        worksheet_name: '',
        id: 0
      };
      this.$refs.formWorksheet.resetFields();
      this.value = true;
    },
    save() {
      this.buttonLoading = true;
      this.$refs.formWorksheet.validate(async(valid) => {
        if (!valid) {
          this.buttonLoading = false;
        } else {
          this.$emit('edited', {id: this.formWorksheet.id, worksheet_name: this.formWorksheet.worksheet_name});
          this.value = false;
          this.buttonLoading = false;
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
</style>
