<template>
    <i-modal
        class="project-edit"
        title="选择数据源"
        :width="400"
        v-model="modalShow"
        @on-visible-change="visibleChange">
        <i-form label-position="right" :label-width="90">
            <i-form-item label="数据源">
                <Select v-model="selectSource" filterable>
                    <Option v-for="source in sources" :value="source.id" :key="source.id">{{ source.source_name }}</Option>
                </Select>
            </i-form-item>
        </i-form>
        <div slot="footer">
            <i-button type="text" size="large" @click.native="cancel">取消</i-button>
            <i-button type="primary" size="large" @click.native="save">保存</i-button>
        </div>
    </i-modal>
</template>

<script>
import createApi from 'common/create-api';
import {mapState} from 'vuex';

export default {
  name: 'ModalSelectSource',
  props: {
    projectId: Number
  },
  computed: {
    ...mapState(['project']),
  },
  data() {
    return {
      selectSource: '',
      modalShow: false,
      sources: []
    };
  },
  methods: {
    visibleChange(visible) {
      if (!visible) {
        this.reset();
      }
    },
    cancel() {
      this.modalShow = false;
    },
    reset() {
      this.selectSource = '';
    },
    async show() {
      this.modalShow = true;

      const {code, data} = await createApi.get('/source/fetch-list', {project_id: this.projectId});

      if (code === 200) {
        this.sources = data;
      }
    },
    save() {
      if (!this.selectSource) {
        this.$Message.warning('请选择数据源');
        return;
      }

      this.$emit('on-select', {sourceId: this.selectSource});
    }
  }
};
</script>

<style>

</style>
