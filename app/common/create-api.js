import axios from 'axios';
import iView from 'iview';
import config from 'config';
import bus from 'utils/bus';

axios.defaults.baseURL = config.axiosBaseUrl;
axios.defaults.responseType = config.axiosResponseType;
axios.defaults.headers = {
  'X-Requested-With': 'XMLHttpRequest'
};

const errHandle = ({response}) => {
  let error = {
    code: 500,
    message: response.data && response.data.message || '接口异常'
  };

  if (response.status === 401) {
    const {data} = response;

    if (data) {
      error = data;
      if (data.code !== 999) {
        bus.$emit('logout');
      }
    }
  }
  return Promise.reject(error);
};
const request = async(options) => {
  try {
    return await axios(options).then(res => res.data, errHandle);
  } catch ({message}) {
    iView.Message.destroy();
    iView.Message.warning(message);
    return void 0;
  }
};

export default {
  async get(url, params, options) {
    return await request(Object.assign({
      url,
      params,
      method: 'get'
    }), options);
  },
  async post(url, data, options) {
    return await request(Object.assign({
      url,
      data,
      method: 'post'
    }, options));
  }
};
