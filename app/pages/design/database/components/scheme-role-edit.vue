<template>
    <div class="scheme-role-edit">
        <div class="scheme-list">
            <p class="title">选择Scheme:</p>
            <div
                class="scheme"
                :class="{selected: scheme.selected, complete: scheme.status}"
                v-for="scheme in currentSchemes"
                :key="scheme.name"
                @click="chooseScheme(scheme)">
                <span>
                    {{scheme.name}}
                </span>
                <i-icon type="checkmark" v-if="scheme.status"></i-icon>
            </div>
        </div>
        <div class="role-list">
            <p class="title">选择权限:</p>
            <checkbox-role :roles="schemeRoles" @on-change="onChangeRole"></checkbox-role>
        </div>
    </div>
</template>

<script>
import _ from 'lodash';

export default {
  name: 'SchemeRoleEdit',
  props: {
    schemes: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      currentSchemes: this.schemes || []
    };
  },
  watch: {
    schemes(val) {
      this.currentSchemes = val || [];
    }
  },
  computed: {
    schemeRoles() {
      const scheme = _.find(this.currentSchemes, s => s.selected);

      return scheme ? scheme.roles : [];
    },
    currentScheme() {
      return _.find(this.currentSchemes, s => s.selected);
    }
  },
  methods: {
    onChangeRole(roles) {
      if (this.currentScheme) {
        this.currentScheme.roles = roles;
        this.currentScheme.status = roles.length ? true : false;
      }
    },
    chooseScheme(scheme) {
      if (scheme.selected) {
        scheme.selected = false;
      } else {
        _.each(this.currentSchemes, s => {
          s.selected = false;
        });

        scheme.selected = true;
      }
    },
    getValues() {
      return _.map(this.currentSchemes, s => {
        return {
          scheme: s.name,
          roles: s.roles
        };
      });
    }
  }
};
</script>

<style lang="scss">
.scheme-role-edit {
  padding-left: 20px;
  padding-right: 20px;
  height: 300px;
  display: flex;

  .scheme-list {
    width: 200px;
    border: solid 1px #e9eaec;
    height: 100%;
    overflow-y: auto;
  }

  .scheme {
    line-height: 25px;
    padding-left: 10px;
    padding-right: 10px;
    cursor: pointer;
    transition: background 0.2s ease-in-out;
    display: flex;

    span {
      flex: 1;
    }

    i {
      width: 20px;
      text-align: right;
      line-height: 25px;
    }

    &.selected {
      background: rgba(45, 140, 240, 0.9) !important;
      color: #fff;
    }

    &.complete {
      i {
        color: #19be6b;
      }
    }

    &:hover {
      background: #f3f3f3;
    }
  }

  .role-list {
    flex: 1;
    padding-left: 20px;

    .title {
      line-height: 25px;
    }
  }
}
</style>
