<template>
    <i-modal v-model="showModal" title="编辑" :width="400">
        <i-form :label-width="80">
            <i-form-item label="角色名">
                <i-input type="text" placeholder="角色名" v-model="model.roleName"></i-input>
            </i-form-item>
            <i-form-item label="数据过滤">
                <i-checkbox-group v-model="model.filters">
                    <i-checkbox :label="filter.id" v-for="filter in filters" :key="filter.id">
                        {{filter.filterName}}
                    </i-checkbox>
                </i-checkbox-group>
            </i-form-item>
        </i-form>
        <div slot="footer">
            <i-button type="text" size="large" @click.native="cancel">取消</i-button>
            <i-button type="primary" size="large" :loading="buttonLoading" @click.native="save">保存</i-button>
        </div>
    </i-modal>
</template>

<script>

import _ from 'lodash';
import * as Types from 'store/role/types';
import * as DatabaseTypes from 'store/database/types';
import {mapState} from 'vuex';

export default {
  name: 'RoleEdit',
  computed: {
    ...mapState(['role'])
  },
  data() {
    return {
      showModal: false,
      chkShop: false,
      model: {
        roleName: '',
        filters: [],
      },
      filters: [],
      buttonLoading: false
    };
  },
  methods: {
    show(id) {
      this.getRoleFilters();
      this.model = {
        id,
        roleName: '',
        filters: []
      };
      this.getRoleData();
      this.showModal = true;
    },
    async getRoleFilters() {
      if (!this.filters.length) {
        const result = await this.$store.dispatch(DatabaseTypes.FETCH_DATABASE_FILTER);

        if (result && result.code === 200) {
          this.filters = result.data;
        }
      }
    },
    async getRoleData() {
      if (!this.model.id) {
        return;
      }
      const result = await this.$store.dispatch(Types.FETCH_ROLE_REQUEST, {id: this.model.id});

      if (result) {
        if (result.code === 200) {
          this.model = {
            id: this.model.id,
            roleName: result.data.roleName,
            filters: _.map(result.data.filters, f => f.id)
          };
        } else {
          this.$Message.warning(result.message);
        }
      }
    },
    cancel() {
      this.showModal = false;
    },
    async save() {
      this.buttonLoading = true;
      const result = await this.$store.dispatch(Types.UPDATE_ROLE_REQUEST, this.model);

      this.buttonLoading = false;

      if (result) {
        if (result.code === 200) {
          this.$store.dispatch(Types.FETCH_ROLES_REQUEST, {});
          this.$Message.success('保存成功');
          this.showModal = false;
        } else {
          this.$Message.warning(result.message);
        }
      }
    }
  },
};
</script>

<style>

</style>
