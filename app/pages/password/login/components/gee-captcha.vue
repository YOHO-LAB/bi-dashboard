<template>
<div id="img-check-main"></div>
</template>
<script>
import {GET_GEE_CAPTCHA} from 'store/bi/types';
import {mapState} from 'vuex';
import 'statics/js/gt';

export default {
  name: 'gee-captcha-box',
  props: ['failNum'],
  computed: {
    ...mapState(['bi'])
  },
  created() {
    this.captchaInit();
  },
  watch: {
    failNum() {
      this._captchObj.reset();
    }
  },
  methods: {
    captchaInit() {
      let that = this;

      this.$store.dispatch(GET_GEE_CAPTCHA).then(function(result) {
        if (result.code === 500) {
          this.$Message.error('验证码加载异常');
          return;
        }
                initGeetest && initGeetest({  // eslint-disable-line
          gt: result.data.gt,
          challenge: result.data.challenge,
          width: '100%',
          product: 'float', // 产品形式，包括：float，embed，popup。注意只对PC版验证码有效
          new_captcha: result.data.new_captcha,
          offline: !result.data.success // 表示用户后台检测极验服务器是否宕机，一般不需要关注
        }, that.initCallback);
      });
    },
    initCallback: function(captchaObj) {
      var _this = this;

      _this._captchObj = captchaObj;

      captchaObj.onSuccess(function() {
        var validate = captchaObj.getValidate();

        _this._result = [
          validate.geetest_challenge,
          validate.geetest_validate,
          validate.geetest_seccode
        ];

        _this.$emit('change', _this._result);
      });

      captchaObj.onError(function() {
        _this._result = [];
      });

      captchaObj.onClose(function() {
        _this._result = [];
      });

      captchaObj.appendTo(document.getElementById('img-check-main'));
    }
  }
};
</script>
<style lang="scss">

</style>

