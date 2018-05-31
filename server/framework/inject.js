const _ = require('lodash');
const YohoException = require('./exception');
const injectConfig = require('../common/inject-config');
const REG_CONST = /constructor[^(]*\(([^)]*)\)[^{]*\{/;
const dependCaches = {};

module.exports.injectCreate = (Type, injects) => {
  let depends;

  if (dependCaches[Type]) {
    depends = dependCaches[Type];
  } else {
    const code = Type.prototype.constructor.toString();
    const matchs = REG_CONST.exec(code);

    depends = matchs && matchs[1] && _.filter(_.map(_.split(matchs[1], ','), arg => {
      const injectObj = _.find(injectConfig, c => c.alias === _.trim(arg));

      return injectObj ? injectObj.bind : null;
    }), d => d) || [];
    dependCaches[Type] = depends;
  }

  try {
    const dependsInstances = _.map(depends, d => module.exports.injectCreate(d, injects));
    const instance = new Type(...dependsInstances);

    if (injects) {
      _.each(injects, (inject, key) => {
        instance[key] = inject;
      });
    }
    return instance;
  } catch (e) {
    throw new YohoException(`${Type.name} inject error detail error: [${e.message}]`);
  }
};
