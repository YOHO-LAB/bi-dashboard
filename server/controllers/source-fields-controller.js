const Controller = require('../framework/controller');
const {BiProjectSourceFields} = require('../db');

class SourceFieldsController extends Controller {
  static route() {
    return [
      { path: '/fetch-list', action: 'FetchList', purview: '0206' },
    ];
  }
  async FetchList(req, res) {
    const queryData = await BiProjectSourceFields.findAll({
      attributes: ['id', 'source_id', 'field_name', 'field_alias', 'field_ori_type', 'field_type', 'created_at'],
      where: {
        source_id: req.query.source_id
      }
    });

    res.json({
      code: 200,
      data: queryData
    });
  }
}

module.exports = SourceFieldsController;
