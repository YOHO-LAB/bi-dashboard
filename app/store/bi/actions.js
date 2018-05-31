import {
  GET_GEE_CAPTCHA,
} from './types';

export default {
  async [GET_GEE_CAPTCHA]() {
    return await this.$api.get('/captcha/get');
  }
};
