<template>
    <i-modal
        class="calc-field-edit"
        title="编辑计算字段"
        :width="500"
        v-model="modalShow"
        @on-visible-change="visibleChange">
        <div class="calc-box">
            <i-input class="inp-title" v-model="alias" placeholder="请填写字段名称"></i-input>
            <textarea ref="calcBox" v-show="false" name="" id="" v-model="calcValue"></textarea>
            <div class="example">
                例如(暂行版)：
                <p>1.SUM([Discount]) + SUM([Profit]) 聚合值计算</p>
                <p>2.[Discount] + [Profit] 计算后聚合</p>
                <p>3.[ORDER_CHANNEL] || [PAYMENT] 字符串拼接</p>
            </div>
        </div>
        <div slot="footer" class="calc-field-edit-footer">
            <div class="calc-field-tips">
                {{tips}}
            </div>
            <i-button type="text" size="large" @click.native="cancel">取消</i-button>
            <i-button type="primary" size="large" :loading="buttonLoading" @click.native="save">保存</i-button>
        </div>
    </i-modal>
</template>

<script>
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/hint/show-hint.js';
import 'codemirror/addon/hint/show-hint.css';
import './cm-hint';
import './cm-math';
import codeMirror from 'codemirror';
import _ from 'lodash';
import {
  GETTER_CALC_MATH,
  TEST_CALC_FIELD,
} from 'store/worksheet/types';
import {mapState, mapGetters} from 'vuex';

export default {
  name: 'ModalCalcField',
  data() {
    return {
      buttonLoading: false,
      modalShow: false,
      tips: '',
      alias: '',
      calcValue: ''
    };
  },
  computed: {
    ...mapState(['worksheet']),
    ...mapGetters([GETTER_CALC_MATH])
  },
  methods: {
    visibleChange(visible) {
      if (!visible) {
        this.reset();
      }
    },
    reset() {
      this.value = void 0;
      this.calcValue = '';
      this.alias = '';
      this.tips = '';
      if (this.codeMirror) {
        this.codeMirror.setValue(this.calcValue);
        this.codeMirror.refresh();
      }
    },
    render() {
      this.$nextTick(() => {
        if (this.codeMirror) {
          return;
        }
        const maths = _.map(this[GETTER_CALC_MATH], m => {
          return {
            title: m.title,
            type: 'G'
          };
        });

        this.codeMirror = codeMirror.fromTextArea(this.$refs.calcBox, {
          extraKeys: {'Ctrl-Space': 'autocomplete'},
          mode: 'yohobi',
          lineWrapping: true,
          hintOptions: {
            words: [].concat(maths, this.worksheet.measures, this.worksheet.dimensions),
            completeSingle: false,
            closeOnUnfocus: false,
          },
        });
        this.codeMirror.focus();
        this.codeMirror.on('change', () => {
          this.codeMirror.execCommand('autocomplete');
        });
      });
    },
    cancel() {
      this.modalShow = false;
    },
    show(value) {
      this.modalShow = true;
      this.$nextTick(() => {
        if (value) {
          this.value = value;
          this.calcValue = value.calc.value;
          if (this.codeMirror) {
            this.codeMirror.doc.setValue(value.calc.value);
            this.codeMirror.refresh();
          }
          this.alias = value.alias;
        }
        this.render();
      });
    },
    checkCalc(val, name) {
      const data = {
        alias: name,
      };
      const maths = _.join(_.map(this[GETTER_CALC_MATH], m => m.title), '|');
      const regField = /\[([^\]]+)\]/g;
      const regMath = new RegExp(`\\b(${maths})\\b`);
      let calcType = '';
      const fields = [];
      let result;

            while (result = regField.exec(val)) { //eslint-disable-line
        fields.push(result[1]);
      }
      if (fields.length === 0) {
        this.tips = '计算公式错误，请重新编辑，请正确填写字段';
        return void 0;
      }
      const isMeasure = _.every(fields, f => _.some(this.worksheet.measures, m => m.title === f));

      if (isMeasure) {
        data.type = 'M';
      } else {
        const isDimension = _.every(fields, f => _.some(this.worksheet.dimensions, m => m.title === f));

        if (isDimension) {
          data.type = 'D';
        }
      }
      if (!data.type) {
        this.tips = '计算公式错误，请重新编辑，度量和维度字段必须统一';
        return void 0;
      }
      if (regMath.test(val)) {
        calcType = 'GROUP';
      }
      data.calc = {
        type: calcType,
        value: val
      };

      return data;
    },
    async save() {
      const val = this.codeMirror.doc.getValue();

      this.tips = '';
      if (!this.alias) {
        this.tips = '请填写字段名称';
        return;
      }

      if (val) {
        const value = this.checkCalc(val, this.alias);

        if (!value) {
          return;
        }
        value.title = this.value ? this.value.title : '';

        this.buttonLoading = true;
        const success = await this.$store.dispatch(TEST_CALC_FIELD, {value});

        if (!success) {
          this.tips = '计算公式错误，请重新编辑';
        } else {
          this.modalShow = false;
          this.$Message.success('编辑成功');
          this.$emit('on-calc-add', {value});
        }
        this.buttonLoading = false;
      }
    }
  }
};
</script>

<style lang="scss">
.calc-field-edit {
  .CodeMirror { /* stylelint-disable-line */
    height: 100px;
    border: solid 1px #e9eaec;
  }

  .calc-field-edit-footer {
    display: grid;
    grid-template-rows: 1fr;
    grid-template-columns: 1fr auto auto;
  }

  .calc-box {
    .inp-title {
      width: 120px;
      padding-bottom: 20px;
    }
  }

  .example {
    margin-top: 10px;
    color: #bbbec4;
  }

  .calc-field-tips {
    text-align: left;
    line-height: 30px;
    color: #ed3f14;
  }
}

.cm-s-default {
  .cm-math {
    color: #f18a34;
  }

  .cm-field {
    color: #377e9c;
  }
}

.bi-hint-item {
  &.CodeMirror-hint { /* stylelint-disable-line */
    padding: 0;
  }

  .hint-icon {
    width: 20px;
    display: inline-block;
    text-align: center;

    &.dimension {
      transform: scale(0.7);
      color: #4996b2;
    }

    &.measure {
      color: #00b180;
      font-size: 13px;
    }

    &.math {
      color: #bbb;
      font-size: 13px;
      font-weight: bold;
    }
  }

  &.CodeMirror-hint-active { /* stylelint-disable-line */
    .ivu-icon {
      color: #fff;
    }
  }
}
</style>
