const Service = require('../framework/service');
const {BiProjectViews, BiProjectViewsWorksheet} = require('../db');

class StatementService extends Service {
  constructor() {
    super(BiProjectViews);
  }
  async checkWorksheetByView(worksheetId, viewId) {
    return await BiProjectViewsWorksheet.findOne({
      where: {
        view_id: viewId,
        worksheet_id: worksheetId,
        is_del: 0
      }
    });
  }
}

module.exports = StatementService;
