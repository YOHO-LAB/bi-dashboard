const sequelize = require('sequelize');
const Service = require('../framework/service');
const {BiUsers, BiRoles} = require('../db');
const {LdapUtil, EncryptUtil} = require('../utils');

const Op = sequelize.Op;

class UserService extends Service {
  constructor() {
    super(BiUsers);
  }
  async createUser(user) {
    return await BiUsers.create({
      role_id: 2,
      user_name: user.sAMAccountName,
      real_name: user.name,
      email: user.mail,
      status: 1,
    });
  }
  syncSession(context, data, user) {
    delete context.req.session.isCaptcha;
    context.res.clearCookie('_captcha');
    context.req.session.USER = data;
    context.req.session.USER_ID = user.id;
    context.req.session.ROLE_ID = user.role_id;

    context.res.cookie('_isLogin', true, {
      path: '/'
    });
  }
  async getUser(id) {
    return await BiUsers.find({
      include: [{
        model: BiRoles,
        as: 'Role'
      }],
      where: {id}
    });
  }
  async getUsers({page, size}) {
    const data = await BiUsers.findAndCountAll({
      include: [{
        model: BiRoles,
        as: 'Role'
      }],
      offset: (page - 1) * size,
      limit: size
    });

    return data;
  }
  async checkUser({userName, password}, authType) {
    if (authType === 'ldap') {
      const ldUser = await LdapUtil.checkUser(userName, password);

      if (!ldUser) {
        return void 0;
      }
      const user = await BiUsers.find({
        where: {
          user_name: userName,
          status: 1
        }
      });

      if (user) {
        return user;
      }
      return await BiUsers.create({
        role_id: 2,
        user_name: ldUser.sAMAccountName,
        real_name: ldUser.name,
        email: ldUser.mail,
        status: 1,
      });
    } else if (authType === 'account') {
      return await BiUsers.find({
        where: {
          user_name: userName,
          [Op.or]: [{
            user_pwd: EncryptUtil.md5(password)
          }, {
            user_pwd: null
          }],
          status: 1
        }
      });
    }
  }
  async updateUser(user, authType) {
    const {id} = user;
    let model;

    if (id) {
      model = await BiUsers.find({
        where: {
          id
        }
      });

      if (!model) {
        return false;
      }
    }

    if (authType === 'ldap' && model) {
      model.role_id = user.role_id;
      return await model.save();
    } else if (authType === 'account') {
      if (model) {
        Object.assign(model, {
          role_id: user.role_id,
          real_name: user.real_name,
          email: user.email,
          status: user.status
        });
        if (user.user_pwd) {
          model.user_pwd = EncryptUtil.md5(user.user_pwd);
        }
        return await model.save();
      } else {
        user.create_user = this.$user.userId;
        user.user_pwd = EncryptUtil.md5(user.user_pwd);
        return await BiUsers.create(user);
      }
    }
    return false;
  }
  async userStatus({uid, status}) {
    const user = await BiUsers.find({
      where: {
        id: uid
      }
    });

    if (!user) {
      return false;
    }
    user.status = status;
    await user.save();

    return true;
  }
}

module.exports = UserService;
