import _ from 'lodash';
import dayjs from 'dayjs';

/**
 * unix timestamp format
 * @param value
 * @returns {string}
 * @example
 * timeFormat(1495787643)
 * timeFormat({time: 1495787643})
 * timeFormat({time: 1495787643, format: moment支持的format格式'})
 */
export default (value) => {
  let format;
  let unixStamp;
  const isNum = _.isFinite(value);
  const isObj = _.isPlainObject(value);
  const defaultFmt = 'YYYY-MM-DD HH:mm:ss';

  if (isNum) {
    unixStamp = value;
    format = defaultFmt;
  } else if (isObj) {
    unixStamp = value.time;
    format = value.format || defaultFmt;
  } else {
    return dayjs(value).format(defaultFmt);
  }

  return dayjs.unix(unixStamp).format(format);
};

