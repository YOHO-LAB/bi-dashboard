<template>
    <i-card class="view-list flex-card">
        <p slot="title">视图-工作簿</p>
        <drag-box
            id="worksheet"
            :allow="[]">
            <div v-for="worksheet in worksheets" :key="'view_list_' + worksheet.id">
                <drag-box-item
                    class="drop-light"
                    :value="worksheet"
                    v-if="!worksheet.active">
                    <div
                        :class="['view-card', {active: worksheet.active}]">
                        <p class="title">{{worksheet.worksheet_name}}</p>
                        <p class="intro">
                            <img :src="worksheet.worksheet_purview" draggable="false" :alt="worksheet.worksheet_name">
                        </p>
                    </div>
                </drag-box-item>
                <div v-else :class="['view-card', {active: worksheet.active}]">
                    <p class="title">{{worksheet.worksheet_name}}</p>
                    <p class="intro">
                        <img :src="worksheet.worksheet_purview" draggable="false" :alt="worksheet.worksheet_name">
                    </p>
                </div>
            </div>
        </drag-box>
    </i-card>
</template>
<script>
import {mapGetters} from 'vuex';
import * as Types from 'store/view/types';

export default {
  name: 'WorksheetsCard',
  computed: {
    ...mapGetters({
      worksheets: Types.GETTER_VIEW_WORKSHEETS
    }),
  },
  props: {
    projectId: Number
  },
  created() {
    this.$store.dispatch(Types.VIEW_WORKSHEETS_FETCH_REQUEST, {project_id: this.projectId});
  },
  data() {
    return {};
  },
  components: {}
};
</script>

<style lang="scss">
.view-list {
  .ivu-card-body {
    padding: 0;

    .drag-box {
      padding: 9px;
    }
  }
}

.view-card {
  margin-bottom: 20px;
  border-radius: 5px;
  border: 1px solid #e9eaec;
  opacity: 1;

  &:hover {
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
  }

  &.active {
    opacity: 0.6;
    color: #fff;

    &:hover {
      box-shadow: initial;
    }
  }

  .title {
    font-size: 13px;
    color: #367e9c;
    font-weight: bold;
    border-bottom: solid 1px #e9eaec;
    margin: 0 10px;
    padding: 8px 0;
    line-height: 1;
  }

  .intro {
    height: 120px;
    line-height: 120px;
    overflow: hidden;
    margin-top: 5px;
    padding: 5px 16px;

    img {
      max-width: 100%;
      max-height: 100%;
    }
  }
}
</style>
