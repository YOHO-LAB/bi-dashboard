const ldap = require('ldapjs');
const YoHoException = require('../framework/exception');
const config = global.yoho.config;

let client;

const createClient = () => {
  client = ldap.createClient({
    url: config.ldap.url,
    tlsOptions: {
      rejectUnauthorized: false
    },
    reconnect: true
  });
  return client;
};
const searchUser = (userName) => {
  return new Promise((resolve, reject) => {
    const searchPath = config.ldap.dcs.map(dc => {
      return `dc=${dc}`;
    }).join(',');

    client.search(searchPath, {
      scope: 'sub',
      filter: `(&(objectclass=person)(sAMAccountName=${userName}))`
    }, (error, res) => {
      res.on('searchEntry', function(entry) {
        resolve(entry.object);
      });
      res.on('error', function(e) {
        console.log(e);
        reject(e.message);
      });
    });
  });
};

const checkUser = (userName, password) => {
  if (!config.ldap) {
    throw new YoHoException('缺少ldap配置');
  }
  return new Promise((resolve, reject) => {
    try {
      if (!client) {
        client = createClient();
      }
      const bindPath = config.ldap.dcs.join('.');

      client.bind(`${userName}@${bindPath}`, password, async(err) => {
        if (err) {
          return resolve(void 0);
        }
        try {
          const user = await searchUser(userName);

          resolve(user);
          client.unbind();
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  checkUser
};
