<template>
    <i-modal
        class="modal-relation"
        title="编辑表关联"
        :width="520"
        v-model="showValue">
        <div>
            <div class="relation-box">
                <p class="title">关联方式:</p>
                <div class="relation-item">
                    <div class="rela-table left">
                        <p class="name"><b>{{fromTable.tableName}}</b></p>
                        <p class="scheme">scheme:{{fromTable.schemeName}}</p>
                    </div>
                    <div class="center">
                        <i-select v-model="join" >
                            <i-option value="INNER">INNER</i-option>
                            <i-option value="LEFT">LEFT</i-option>
                        </i-select>
                    </div>
                    <div class="rela-table right">
                        <p class="name"><b>{{toTable.tableName}}</b></p>
                        <p class="scheme">scheme:{{toTable.schemeName}}</p>
                    </div>
                </div>
            </div>
            <div class="condition-box">
                <p class="title">条件:</p>
                <div class="condition-item" v-for="(rela, index) in conditions" :key="index">
                    <i-select class="left" v-model="rela.mainField" >
                        <i-option v-for="col in fromTable.columns" :key="col.title" :value="col.title">{{col.title}}</i-option>
                    </i-select>
                    <i-select class="center" v-model="rela.relationCondition" placement="bottom">
                        <i-option value="=">=</i-option>
                        <i-option value=">">&gt;</i-option>
                        <i-option value="<">&lt;</i-option>
                    </i-select>
                    <i-select class="right" v-model="rela.belongField" >
                        <i-option v-for="col in toTable.columns" :key="col.title" :value="col.title">{{col.title}}</i-option>
                    </i-select>
                    <div class="op">
                        <i-icon v-if="index === 0" class="add" type="plus-round" title="增加条件" @click.native="onPlusClick"></i-icon>
                        <i-icon v-else class="del" type="ios-minus-outline" @click.native="onMinusClick(index)"></i-icon>
                    </div>
                </div>
            </div>
        </div>
        <div slot="footer">
            <i-button type="text" size="large" @click="cancel">取消</i-button>
            <i-button type="error" size="large" v-if="showDel" @click="del">删除</i-button>
            <i-button type="primary" size="large" @click="save">确定</i-button>
        </div>
    </i-modal>
</template>

<script>
import _ from 'lodash';
import {mapState} from 'vuex';

export default {
  name: 'ModalRealtion',
  computed: {
    ...mapState(['database']),
    fromTable() {
      if (this.from) {
        const find = _.find(this.database.viewTables, t => t.id === this.from);

        if (find) {
          return find;
        }
      }
      return {
        columns: []
      };
    },
    toTable() {
      if (this.to) {
        const find = _.find(this.database.viewTables, t => t.id === this.to);

        if (find) {
          return find;
        }
      }
      return {
        columns: []
      };
    },
    showDel() {
      if (this.to) {
        const find = _.find(this.database.viewRelations, t => t.to && t.to === this.to && t.from === this.from);

        if (find) {
          return true;
        }
      }
    }
  },
  data() {
    return {
      conditions: [],
      from: 0,
      to: 0,
      join: 'INNER',
      showValue: false
    };
  },
  methods: {
    show(data) {
      const {from, to, join, conditions} = _.clone(data);

      this.from = from;
      this.to = to;
      this.conditions = conditions || [{
        mainField: '',
        belongField: '',
        relationCondition: '='
      }];
      this.join = join || 'INNER';

      this.showValue = true;
    },
    cancel() {
      this.showValue = false;
    },
    save() {
      if (!this.check()) {
        return this.$Message.warning('请选择关联字段');
      }
      this.$emit('on-save-relation', {
        from: this.from,
        to: this.to,
        join: this.join,
        conditions: this.conditions
      });
      this.showValue = false;
    },
    check() {
      const check = _.some(this.conditions, rela => !rela.mainField || !rela.belongField || !rela.relationCondition);

      return !check;
    },
    del() {
      console.log({
        from: this.from,
        to: this.to
      });
      this.$emit('on-del-relation', {
        from: this.from,
        to: this.to
      });
      this.showValue = false;
    },
    onPlusClick() {
      this.conditions.push({
        mainField: '',
        belongField: '',
        relationCondition: '='
      });
    },
    onMinusClick(index) {
      this.conditions = _.filter(this.conditions, (rela, inx) => inx !== index);
    }
  }
};
</script>

<style lang="scss">
.modal-relation {
  .relation-box {
    .relation-item {
      display: flex;
    }

    .title {
      line-height: 30px;
    }
  }

  .condition-box {
    margin-top: 10px;

    .title {
      line-height: 30px;
    }

    .condition-item {
      display: flex;
      margin-bottom: 10px;

      .left,
      .right {
        flex: 1;
      }

      .center {
        width: 70px;
        padding-left: 10px;
        padding-right: 10px;

        .ivu-select-dropdown {
          width: 50px !important;
        }
      }
    }

    .op {
      width: 40px;
      line-height: 30px;
      font-size: 20px;
      font-weight: bold;
      cursor: pointer;
      text-align: center;

      .del {
        color: #ed3f14;
      }

      .add {
        color: #000;
      }
    }
  }

  .rela-table {
    flex: 1;
    overflow: hidden;

    .name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .ivu-select {
      margin-top: 10px;
    }

    b {
      font-size: 15px;
    }

    .scheme {
      font-size: 12px;
      line-height: 13px;
      color: #757575;
    }
  }

  .center {
    width: 120px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>
