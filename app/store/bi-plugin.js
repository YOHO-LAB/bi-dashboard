import * as Types from './user/types';
import crypto from 'utils/crypto';

export default store => {
  const userLs = localStorage.getItem('user');
  const purviewsLs = localStorage.getItem('purviews');

  if (userLs && purviewsLs) {
    const user = crypto.aesDecrypt(userLs, Object);
    const purviews = crypto.aesDecrypt(purviewsLs, Object);

    store.commit(Types.LOGIN_USER_SUCCESS, {data: user, isLoad: true});
    store.commit(Types.FETCH_PURVIEW_SUCCESS, {data: purviews, isLoad: true});
  }

  store.subscribe((mutation) => {
    if (mutation.type === Types.LOGIN_USER_SUCCESS) {
      const {data, isLoad} = mutation.payload;

      !isLoad && localStorage.setItem('user', crypto.aesEncrypt(data));
    } else if (mutation.type === Types.FETCH_PURVIEW_SUCCESS) {
      const {data, isLoad} = mutation.payload;

      !isLoad && localStorage.setItem('purviews', crypto.aesEncrypt(data));
    } else if (mutation.type === Types.USER_LOGOUT) {
      localStorage.removeItem('user');
      localStorage.removeItem('purviews');
    }
  });
};

