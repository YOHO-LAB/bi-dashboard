<template>
    <div class="login-layout">
        <div class="login-content">
            <p class="login-title">
                Yoho!BI
            </p>
            <i-card class="login-card">
                <i-form ref="formInline" :model="formInline" :rules="ruleInline">
                    <i-form-item prop="user">
                        <i-input type="text" size="large" v-model="formInline.user" placeholder="用户名" @on-enter="login">
                            <i-icon type="ios-person-outline" slot="prepend"></i-icon>
                        </i-input>
                    </i-form-item>
                    <i-form-item prop="password">
                        <i-input type="password" size="large" v-model="formInline.password" placeholder="密码" @on-enter="login">
                            <Icon type="ios-locked-outline" slot="prepend"></Icon>
                        </i-input>
                    </i-form-item>
                    <i-form-item>
                        <gee-captcha v-if="useGeetest" :failNum="failNum" @change="captchaChange"></gee-captcha>
                        <i-button v-else style="width: 100%;" size="large" type="primary" @click="login">登录</i-button>
                    </i-form-item>
                </i-form>
            </i-card>
        </div>
    </div>
</template>

<script>
import * as UserTypes from 'store/user/types';
import GeeCaptcha from './components/gee-captcha';
import config from 'config';

export default {
  name: 'Login',
  data() {
    return {
      useGeetest: false,
      captcha: '',
      failNum: 0,
      formInline: {
        user: '',
        password: ''
      },
      ruleInline: {
        user: [
          { required: true, message: '请填写用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请填写密码', trigger: 'blur' },
          { type: 'string', min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
        ]
      }
    };
  },
  async created() {
    this.useGeetest = config.useGeetest;
  },
  methods: {
    login() {
      this.$refs.formInline.validate((valid) => {
        if (valid) {
          this.postLogin(this.formInline.user, this.formInline.password, this.captcha);
        } else {
          this.$Message.error('表单验证失败!');
          this.failNum++;
        }
      });
    },
    captchaChange(vals) {
      this.captcha = vals;
      this.login();
    },
    async postLogin(userName, password, captcha) {
      this.$Loading.start();
      const result = await this.$store.dispatch(UserTypes.LOGIN_USER_REQUEST, {userName, password, captcha});

      if (result) {
        if (result.code === 200) {
          this.$Loading.finish();
          if (this.$route.query.refer) {
            this.$router.push(this.$route.query.refer);
          } else {
            this.$router.push('/');
          }
        } else {
          this.$Loading.error();
          this.$Message.error(result.message);
          this.failNum++;
        }
      }
    }
  },
  components: {GeeCaptcha}
};
</script>


<style lang="scss" scoped>
.login-layout {
  background-color: rgb(70, 76, 91);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  .login-content {
    width: 350px;
    margin: 200px auto;
  }

  .tips {
    color: red;
    text-align: center;
  }

  .login-title {
    width: 100%;
    text-align: center;
    font-size: 30px;
    color: #fff;
    line-height: 50px;
    padding-bottom: 20px;
  }

  .ivu-form {
    width: 90%;
    margin: 20px auto;
  }

  .login-btn {
    text-align: right;

    button {
      width: 100%;
      height: 36px;
      font-size: 14px;
    }
  }
}
</style>
