const _ = require('lodash');
const purview = require('../server/common/purview-code');

const deepPurview = (pur, level = 0, parent) => {
  let purviews = [];

  if (pur.purview_code) {
    purviews.push({
      purview_name: pur.purview_name,
      purview_code: pur.purview_code,
      purview_level: level,
      purview_parent: parent.purview_code || ''
    });
  }
  _.each(pur, (c) => {
    if (typeof c === 'object') {
      const childPurview = deepPurview(c, level + 1, pur);

      purviews = purviews.concat(childPurview);
    }
  });
  return purviews;
};

const joinSql = () => {
  const purviews = deepPurview(purview);

  console.log('DELETE FROM bi_purviews;');
  _.each(purviews, pur => {
    console.log(`INSERT bi_purviews (id, purview_name, purview_level, purview_parent) VALUES ('${pur.purview_code}', '${pur.purview_name}', ${pur.purview_level},'${pur.purview_parent}');`);
  });
};

joinSql();
