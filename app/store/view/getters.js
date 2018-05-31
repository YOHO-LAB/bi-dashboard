import * as Types from './types';
import _ from 'lodash';

export default {
  [Types.GETTER_VIEW_WORKSHEETS](state) {
    return _.map(state.worksheets, worksheet => {
      return {
        id: worksheet.id,
        worksheet_name: worksheet.worksheet_name,
        worksheet_purview: worksheet.worksheet_purview,
        worksheetResultType: worksheet.worksheetResultType,
        active: _.some(state.dashboards, d => d.worksheet_id === worksheet.id)
      };
    });
  }
};
