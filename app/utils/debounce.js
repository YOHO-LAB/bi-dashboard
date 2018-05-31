const debounce = (idle, action) => { // 函数去抖动，超过一定时间才会执行，如果周期内触发，重置计时器
  let last;

  return function() {
    let args = arguments;

    if (last) {
      clearTimeout(last);
    }
    last = setTimeout(() => {
      action.apply(this, args);
    }, idle);
  };
};


const throttle = (delay, action) => { // 函数节流器，定义函数执行间隔，按频率触发函数
  let last = 0;

  return function() {
    let args = arguments;
    let curr = +new Date();

    if (curr - last > delay) {
      action.apply(this, args);
      last = curr;
    }
  };
};

export default {
  debounce,
  throttle
};
