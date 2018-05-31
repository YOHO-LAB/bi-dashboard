<template>
    <i-modal
        class="project-edit"
        title="编辑视图"
        :width="400"
        v-model="value">
        <i-form ref="formView" :model="formView" :rules="ruleValidate" label-position="right" :label-width="90">
            <i-form-item label="视图名称" prop="view_name">
                <i-input type="text" placeholder="视图名称" v-model="formView.view_name"></i-input>
            </i-form-item>
        </i-form>
        <div slot="footer">
            <i-button type="text" size="large" @click.native="cancel">取消</i-button>
            <i-button type="primary" size="large" :loading="buttonLoading" @click.native="save">保存</i-button>
        </div>
    </i-modal>
</template>

<script>
import createApi from 'create-api';

export default {
  name: 'ModalSource',
  props: {
    autoSave: Boolean
  },
  data() {
    return {
      value: false,
      formView: {
        view_name: '',
        id: 0
      },
      ruleValidate: {
        view_name: [{ required: true, message: '请填写视图名称'}],
      },
      buttonLoading: false,
    };
  },
  methods: {
    show(model) {
      this.formView = model || {
        view_name: '',
        id: 0
      };
      this.$refs.formView.resetFields();
      this.value = true;
    },
    save() {
      this.buttonLoading = true;
      this.$refs.formView.validate(async(valid) => {
        if (!valid) {
          this.buttonLoading = false;
        } else {
          if (this.autoSave) {
            const result = await createApi.post('/view/save-base-data', {
              ...this.formView
            });

            if (result.code === 200) {
              this.$Message.success('保存成功');
              this.value = false;
              this.$emit('edited', this.formView);
            } else {
              this.$Message.warning(result.message);
            }
          } else {
            this.$emit('edited', this.formView);
            this.value = false;
          }
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
