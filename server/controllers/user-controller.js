const _ = require('lodash');
const Controller = require('../framework/controller');
const {CacheUtil} = require('../utils');
const mdCaptchaCheck = require('../middleware/captcha');
const config = global.yoho.config;

class UserController extends Controller {
  static route() {
    return [
      { path: '/login', method: 'post', action: 'Login', auth: false, befores: [mdCaptchaCheck] },
      { path: '/logout', method: 'post', action: 'Logout', auth: false },
      { path: '/test', method: 'get', action: 'Test', auth: false },
      { path: '/fetch-purview', action: 'FetchPurviews' },
      { path: '/fetch-users', action: 'FetchUsers', purview: '0301' },
      { path: '/fetch-user', action: 'FetchUser', purview: '0301' },
      { path: '/change-status', method: 'post', action: 'ChangeStatus', purview: '030102' },
      { path: '/save-data', method: 'post', action: 'SaveData', purview: '030102' },
    ];
  }
  constructor(userService, roleService) {
    super();
    this.userService = userService;
    this.roleService = roleService;
  }
  Test(req, res) {
    res.setTimeout(1000 * 60 * 3 + 1000);
    setTimeout(() => {
      res.send('ok');
    }, 1000 * 60 * 3);
  }
  async Login(req, res) {
    const {userName, password} = req.body;

    if (!userName || !password) {
      return res.json({
        code: 400,
        message: '请输入用户名密码'
      });
    }
    const user = await this.userService.checkUser({userName, password}, config.authType);

    if (!user) {
      return res.json({
        code: 400,
        message: '用户名密码错误或者账号被禁用'
      });
    }
    const role = await this.roleService.getRolePurviews(user.role_id);
    const data = {
      name: user.user_name,
      displayName: user.real_name,
      mail: user.mail,
      roleName: role.role_name
    };

    CacheUtil.set(`purview_${user.role_id}`, _.get(role, 'Purviews', []));
    this.userService.syncSession({req, res}, data, user);

    return res.json({
      code: 200,
      data
    });
  }
  Logout(req, res) {
    delete req.session.USER;
    delete req.session.USER_ID;
    delete req.session.ROLE_ID;
    res.clearCookie('_isLogin');

    return res.json({
      code: 200
    });
  }
  async FetchUser(req, res) {
    const {id} = req.query;
    const user = await this.userService.getUser(id);

    if (!user) {
      return res.json({
        code: 400,
        message: '找不到对应的用户'
      });
    }
    return res.json({
      code: 200,
      data: {
        id: user.id,
        userName: user.user_name,
        realName: user.real_name,
        email: user.email,
        status: user.status,
        roleId: user.Role.id,
        roleName: user.Role.role_name
      }
    });
  }
  async FetchUsers(req, res) {
    let {page = 1, size = 10} = req.query;

    page = _.parseInt(page);
    size = _.parseInt(size);

    if (page < 1 || size <= 0 || size > 100) {
      return res.json({
        code: 400
      });
    }
    const {rows, count} = await this.userService.getUsers({page, size});

    return res.json({
      code: 200,
      data: {
        rows: _.map(rows, user => {
          return {
            id: user.id,
            userName: user.user_name,
            realName: user.real_name,
            email: user.email,
            status: user.status,
            roleId: user.Role.id,
            roleName: user.Role.role_name,
            authType: config.authType
          };
        }),
        count
      }
    });
  }
  async ChangeStatus(req, res) {
    const {status, uid} = req.body;

    if (uid === req.user.userId) {
      return res.json({
        code: 400,
        message: '不能修改自己的状态'
      });
    }
    const result = await this.userService.userStatus({uid, status});

    if (result) {
      return res.json({
        code: 200
      });
    }
    return res.json({
      code: 400,
      message: '修改失败'
    });
  }
  async SaveData(req, res) {
    const {uid, roleId, userName, realName, userPwd, email, status} = req.body;

    if (!roleId || !userName || !realName || !email || (!uid && !userPwd)) {
      return res.json({
        code: 400,
        message: '参数错误'
      });
    }

    const result = await this.userService.updateUser({
      id: uid,
      role_id: roleId,
      user_name: userName,
      user_pwd: userPwd,
      real_name: realName,
      email,
      status
    }, config.authType);

    if (result) {
      req.session.ROLE_ID = roleId;
      return res.json({
        code: 200
      });
    }
    return res.json({
      code: 400,
      message: '修改失败'
    });
  }
  FetchPurviews(req, res) {
    return res.json({
      code: 200,
      data: _.get(req, 'user.purviews', [])
    });
  }
}

module.exports = UserController;
