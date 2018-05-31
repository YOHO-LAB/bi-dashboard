<template>
    <i-modal
        class="modal-project-edit"
        title="编辑项目信息"
        :width="400"
        v-model="value">
        <i-form ref="formProject" :model="formProject" :rules="ruleValidate" label-position="right" :label-width="90">
            <i-form-item label="项目名称" prop="project_name">
                <i-input type="text" placeholder="项目名称" v-model="formProject.project_name"></i-input>
            </i-form-item>
            <i-form-item label="项目描述" prop="project_intro">
                <i-input type="textarea" :rows="4" placeholder="项目描述" v-model="formProject.project_intro"></i-input>
            </i-form-item>
            <i-form-item label="权限" prop="is_public">
                <i-radio-group v-model="formProject.is_public">
                    <i-radio :label="1">
                        <span>公开</span>
                    </i-radio>
                    <i-radio :label="0">
                        <span>私有</span>
                    </i-radio>
                </i-radio-group>
                <div class="tips">
                    *<span v-if="formProject.is_public === 1">同角色用户都可以访问和编辑</span>
                    <span v-else>只能由创建者访问或者编辑</span>
                </div>
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
  name: 'ModalProjectEdit',
  data() {
    return {
      value: false,
      formProject: {
        project_name: '',
        project_intro: '',
        is_public: 1,
        id: 0
      },
      ruleValidate: {
        project_name: [{ required: true, message: '请填写项目名称'}],
        project_intro: [{ required: true, message: '请填写项目描述'}],
      },
      buttonLoading: false,
    };
  },
  methods: {
    show({id = 0, project_name = '', project_intro = '', is_public = 1} = {}) {
      this.formProject = {
        project_name: project_name,
        project_intro: project_intro,
        is_public: is_public,
        id: id
      };
      this.$refs.formProject.resetFields();
      this.value = true;
    },
    save() {
      this.buttonLoading = true;
      this.$refs.formProject.validate(async(valid) => {
        if (!valid) {
          this.buttonLoading = false;
        } else {
          const result = await createApi.post('/project/save-data', {
            ...this.formProject
          });

          if (result.code === 200) {
            this.$Message.success('保存成功');
            this.value = false;
          } else {
            this.$Message.warning(result.message);
          }
          this.buttonLoading = false;
          this.$emit('created', this.formProject);
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
.modal-project-edit {
  .tips {
    color: #666;
  }
}
</style>
