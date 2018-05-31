<template>
    <i-modal
        class="project-edit"
        title="编辑数据源"
        :width="400"
        v-model="value">
        <i-form ref="formSource" :model="formSource" :rules="ruleValidate" label-position="right" :label-width="90">
            <i-form-item label="数据源名称" prop="source_name">
                <i-input type="text" placeholder="数据源名称" v-model="formSource.source_name"></i-input>
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
      formSource: {
        source_name: '',
        id: 0
      },
      ruleValidate: {
        source_name: [{ required: true, message: '请填写数据源名称'}],
      },
      buttonLoading: false,
    };
  },
  methods: {
    show(model) {
      this.formSource = model || {
        source_name: '',
        id: 0
      };
      this.$refs.formSource.resetFields();
      this.value = true;
    },
    save() {
      this.buttonLoading = true;
      this.$refs.formSource.validate(async(valid) => {
        if (!valid) {
          this.buttonLoading = false;
        } else {
          if (this.autoSave) {
            const result = await createApi.post('/source/save-base-data', {
              ...this.formSource
            });

            if (result.code === 200) {
              this.$Message.success('保存成功');
              this.value = false;
              this.$emit('edited', this.formSource);
            } else {
              this.$Message.warning(result.message);
            }
          } else {
            this.$emit('edited', this.formSource);
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
