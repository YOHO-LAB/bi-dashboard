<template>
    <i-modal
        class="modal-select-database"
        title="选择数据库"
        :width="400"
        v-model="showValue"
        @on-visible-change="visibleChange">
        <i-form label-position="right" :label-width="90">
            <i-form-item label="数据库">
                <i-select v-model="selectDb">
                    <i-option v-for="db in databases" :value="db.id" :key="db.id">{{`[${db.host}]${db.name}`}}</i-option>
                </i-select>
            </i-form-item>
        </i-form>
        <div slot="footer">
            <i-button type="text" size="large" @click.native="cancel">取消</i-button>
            <i-button type="primary" size="large" @click.native="save">确定</i-button>
        </div>
    </i-modal>
</template>

<script>
import * as Types from 'store/database/types';

export default {
  name: 'ModalSelectDatabase',
  props: {
    projectId: Number
  },
  data() {
    return {
      selectDb: '',
      showValue: false,
      databases: []
    };
  },
  methods: {
    visibleChange(visible) {
      if (!visible) {
        this.reset();
      }
    },
    cancel() {
      this.showValue = false;
    },
    reset() {
      this.selectDb = '';
    },
    async show() {
      this.showValue = true;

      const result = await this.$store.dispatch(Types.FETCH_DATABASES_ROLE_REQUEST);

      if (result && result.code === 200) {
        this.databases = result.data;
      }
    },
    save() {
      if (!this.selectDb) {
        this.$Message.warning('请选择数据库');
        return;
      }

      this.$emit('on-select', {databaseId: this.selectDb});
      this.showValue = false;
    }
  }
};
</script>

<style>

</style>
