const Service = require('../framework/service');
const {WorksheetProcess} = require('../utils');
const {BiProjectWorksheets, BiProjectSources, BiDatabases, BiProjectSourceFields, BiProjectSourceTableRelations, BiProjectSourceTables, BiProjectSourceTableRelationConditions} = require('../db');

class WorksheetService extends Service {
  constructor(databaseFilterService) {
    super(BiProjectWorksheets);
    this.databaseFilterService = databaseFilterService;
  }
  async deleteWorksheet(worksheetId) {
    const mainWhere = {
      where: {
        id: worksheetId
      }
    };

    return await BiProjectWorksheets.destroy(mainWhere);
  }
  async getFullWorksheetData(worksheetId) {
    return await BiProjectWorksheets.find({
      attributes: ['id', 'worksheet_name', 'worksheet_data'],
      include: [{
        model: BiProjectSources,
        attributes: ['id', 'source_type', 'source_sql'],
        as: 'ProjectSource',
        include: [{
          model: BiDatabases,
          as: 'Database'
        }, {
          model: BiProjectSourceFields,
          as: 'Columns'
        }, {
          model: BiProjectSourceTableRelations,
          as: 'Relations',
          include: [{
            model: BiProjectSourceTableRelationConditions,
            as: 'Conditions'
          }]
        }, {
          model: BiProjectSourceTables,
          as: 'Tables'
        }]
      }],
      where: {
        id: worksheetId
      }
    });
  }
  async getDashboardData({database, source, worksheet: {values, columns, rows, orders, filters}}) {
    const databaseFilter = await this.databaseFilterService.getUserDatabaseFilter(database);
    const dbAdapter = new WorksheetProcess({
      database,
      source,
      dbfilter: databaseFilter
    });
    const data = await dbAdapter.execute({values, columns, rows, orders, filters});

    dbAdapter.close();

    return data;
  }
}

module.exports = WorksheetService;
