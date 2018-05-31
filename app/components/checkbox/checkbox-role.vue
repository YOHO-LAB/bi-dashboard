<template>
    <i-checkbox-group v-model="curRoles" @on-change="checkAllGroupChange">
        <i-checkbox :label="role.id" v-for="role in allRoles" :key="role.id">{{role.roleName}}</i-checkbox>
    </i-checkbox-group>
</template>

<script>
import _ from 'lodash';
import * as Types from 'store/role/types';

export default {
  name: 'CheckboxRole',
  props: {
    roles: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      isShow: false,
      curRoles: this.roles,
      allRoles: []
    };
  },
  watch: {
    roles(val) {
      this.curRoles = _.filter(val, cr => _.some(this.allRoles, r => r.id === cr));
    }
  },
  async created() {
    const result = await this.$store.dispatch(Types.FETCH_ROLES_COMMON_REQUEST);

    if (result && result.code === 200) {
      this.allRoles = result.data;
    }
  },
  methods: {
    checkAllGroupChange() {
      this.$emit('on-change', this.curRoles);
    }
  }
};
</script>

<style lang="scss">
.checkbox-role {
  width: 100%;
  height: 100%;
}
</style>
