const caches = {};

const get = key => {
  return caches[key];
};
const set = (key, value) => {
  caches[key] = value;
};
const remove = (key) => {
  delete caches[key];
};

module.exports = {
  get,
  set,
  remove
};
