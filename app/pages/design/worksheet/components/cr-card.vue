<template>
    <i-card class="cr-card">
        <cr-row title="列" data-type="column" :drag-rec-type="['D']" :value="worksheet.columns" @on-change="onChange"></cr-row>
        <cr-row title="行" data-type="row" :drag-rec-type="['D']" :value="worksheet.rows" @on-change="onChange"></cr-row>
    </i-card>
</template>

<script>
import {mapState} from 'vuex';
import CrRow from './cr-row';

export default {
  name: 'CrCard',
  computed: {
    ...mapState(['worksheet'])
  },
  methods: {
    onChange() {
      this.$emit('on-change');
    }
  },
  components: {CrRow}
};
</script>

<style lang="scss">
</style>
