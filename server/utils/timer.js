/**
 * 计时类
 * @example
 * let timer = new Timer();
 * timer.put('profile');
 * timer.put('proflie'); // console output: 12.14
 *
 * @author: hbomb<qiqi.zhou@yoho.cn>
 * @date: 2016/05/07
 */
'use strict';
class Timer {
  constructor() {
    this.timers = {};
  }

  /**
     * 打点计时
     */
  put(label) {
    const labelTime = this.timers[label];

    if (labelTime) {
      const duration = process.hrtime(labelTime);

      return this._round(duration[0], duration[1]);
    } else {
      this.timers[label] = process.hrtime();
    }
  }

  /**
     * 格式化成毫秒
     * @param {Number} value 纳秒
     */
  _round(seconds, nanoseconds) {
    return Math.round((seconds * 1e9 + nanoseconds) / 10000) / 100;
  }
}
module.exports = Timer;
