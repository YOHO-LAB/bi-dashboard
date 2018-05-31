<template>
    <i-select :value="value" @input="change">
        <i-option v-for="role in roles" :value="role.id" :key="role.id">{{ role.roleName }}</i-option>
    </i-select>
</template>

<script>
import * as Types from 'store/role/types';

export default {
  name: 'SelectRole',
  props: {
    value: [Number, String]
  },
  data() {
    return {
      roles: []
    };
  },
  async created() {
    const result = await this.$store.dispatch(Types.FETCH_ROLES_COMMON_REQUEST);

    if (result && result.code === 200) {
      this.roles = result.data;
    }
  },
  methods: {
    change(val) {
      this.$emit('input', val);
    }
  }
};
</script>
