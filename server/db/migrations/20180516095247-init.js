/* eslint new-cap: "off" */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.createTable('bi_database_filter', {
        id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        filter_name: {
          type: Sequelize.STRING(200),
          allowNull: true
        },
        database_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        database_scheme_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        table_name: {
          type: Sequelize.STRING(200),
          allowNull: true
        },
        field_name: {
          type: Sequelize.STRING(200),
          allowNull: true
        },
        filter_param_type: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        filter_condition: {
          type: Sequelize.STRING(200),
          allowNull: true
        },
        create_user: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        is_del: {
          type: Sequelize.INTEGER(1),
          allowNull: true,
          defaultValue: '0'
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, {
        engine: 'InnoDB',
        charset: 'utf8'
      }),
      queryInterface.createTable('bi_database_scheme_roles', {
        id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        database_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        database_scheme_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        role_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, {
        engine: 'InnoDB',
        charset: 'utf8'
      }),
      queryInterface.createTable('bi_database_schemes', {
        id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        database_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        scheme_name: {
          type: Sequelize.STRING(200),
          allowNull: true,
          defaultValue: ''
        },
        create_user: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        is_del: {
          type: Sequelize.INTEGER(1),
          allowNull: true,
          defaultValue: '0'
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, {
        engine: 'InnoDB',
        charset: 'utf8'
      }),
      queryInterface.createTable('bi_databases', {
        id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING(200),
          allowNull: true,
          defaultValue: ''
        },
        db_host: {
          type: Sequelize.STRING(200),
          allowNull: true,
          defaultValue: ''
        },
        db_port: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        db_user: {
          type: Sequelize.STRING(200),
          allowNull: true,
          defaultValue: ''
        },
        db_password: {
          type: Sequelize.STRING(200),
          allowNull: true,
          defaultValue: ''
        },
        db_name: {
          type: Sequelize.STRING(200),
          allowNull: true,
          defaultValue: ''
        },
        db_version: {
          type: Sequelize.STRING(200),
          allowNull: true,
          defaultValue: ''
        },
        create_user: {
          type: Sequelize.INTEGER(11),
          allowNull: true,
          defaultValue: '0'
        },
        is_del: {
          type: Sequelize.INTEGER(1),
          allowNull: true,
          defaultValue: '0'
        },
        create_role: {
          type: Sequelize.INTEGER(11),
          allowNull: true,
          defaultValue: '0'
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, {
        engine: 'InnoDB',
        charset: 'utf8'
      }),
      queryInterface.createTable('bi_project_source_fields', {
        id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        source_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        table_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        table_scheme_name: {
          type: Sequelize.STRING(200),
          allowNull: true
        },
        table_name: {
          type: Sequelize.STRING(200),
          allowNull: true
        },
        table_alias_name: {
          type: Sequelize.STRING(200),
          allowNull: true
        },
        field_name: {
          type: Sequelize.STRING(200),
          allowNull: true,
          defaultValue: ''
        },
        field_type: {
          type: Sequelize.STRING(50),
          allowNull: true,
          defaultValue: ''
        },
        field_ori_type: {
          type: Sequelize.STRING(200),
          allowNull: true
        },
        field_alias: {
          type: Sequelize.STRING(200),
          allowNull: true
        },
        is_del: {
          type: Sequelize.INTEGER(1),
          allowNull: true,
          defaultValue: '0'
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, {
        engine: 'InnoDB',
        charset: 'utf8'
      }),
      queryInterface.createTable('bi_project_source_table_relation_conditions', {
        id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        relation_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        main_field: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        belong_field: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        relation_condition: {
          type: Sequelize.STRING(20),
          allowNull: true
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, {
        engine: 'InnoDB',
        charset: 'utf8'
      }),
      queryInterface.createTable('bi_project_source_table_relations', {
        id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        source_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        main_table_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        belong_table_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        join_type: {
          type: Sequelize.STRING(20),
          allowNull: true
        },
        is_distinct: {
          type: Sequelize.INTEGER(1),
          allowNull: true
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, {
        engine: 'InnoDB',
        charset: 'utf8'
      }),
      queryInterface.createTable('bi_project_source_tables', {
        id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        source_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        scheme_name: {
          type: Sequelize.STRING(200),
          allowNull: true
        },
        table_name: {
          type: Sequelize.STRING(200),
          allowNull: true
        },
        alias_name: {
          type: Sequelize.STRING(200),
          allowNull: true
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, {
        engine: 'InnoDB',
        charset: 'utf8'
      }),
      queryInterface.createTable('bi_project_sources', {
        id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        project_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        source_name: {
          type: Sequelize.STRING(200),
          allowNull: true,
          defaultValue: ''
        },
        source_table: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        database_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        create_user: {
          type: Sequelize.INTEGER(11),
          allowNull: true,
          defaultValue: '0'
        },
        is_del: {
          type: Sequelize.INTEGER(1),
          allowNull: true,
          defaultValue: '0'
        },
        source_sql: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        source_type: {
          type: Sequelize.STRING(10),
          allowNull: true
        },
        source_distinct: {
          type: Sequelize.INTEGER(1),
          allowNull: true,
          defaultValue: '0'
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, {
        engine: 'InnoDB',
        charset: 'utf8'
      }),
      queryInterface.createTable('bi_project_view_roles', {
        id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        view_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        role_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, {
        engine: 'InnoDB',
        charset: 'utf8'
      }),
      queryInterface.createTable('bi_project_views_worksheet', {
        id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        view_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        worksheet_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        view_order: {
          type: Sequelize.INTEGER(11),
          allowNull: true,
          defaultValue: '0'
        },
        is_del: {
          type: Sequelize.INTEGER(1),
          allowNull: true,
          defaultValue: '0'
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, {
        engine: 'InnoDB',
        charset: 'utf8'
      }),
      queryInterface.createTable('bi_project_views', {
        id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        project_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true,
          defaultValue: '0'
        },
        view_name: {
          type: Sequelize.STRING(200),
          allowNull: true,
          defaultValue: ''
        },
        create_user: {
          type: Sequelize.INTEGER(11),
          allowNull: true,
          defaultValue: '0'
        },
        is_del: {
          type: Sequelize.INTEGER(1),
          allowNull: true,
          defaultValue: '0'
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, {
        engine: 'InnoDB',
        charset: 'utf8'
      }),
      queryInterface.createTable('bi_project_worksheets', {
        id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        project_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        source_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        worksheet_name: {
          type: Sequelize.STRING(200),
          allowNull: true,
          defaultValue: ''
        },
        worksheet_data: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        worksheet_purview: {
          type: Sequelize.STRING(200),
          allowNull: true,
          defaultValue: ''
        },
        create_user: {
          type: Sequelize.INTEGER(11),
          allowNull: true,
          defaultValue: '0'
        },
        is_del: {
          type: Sequelize.INTEGER(1),
          allowNull: true,
          defaultValue: '0'
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, {
        engine: 'InnoDB',
        charset: 'utf8'
      }),
      queryInterface.createTable('bi_projects', {
        id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        project_name: {
          type: Sequelize.STRING(200),
          allowNull: true,
          defaultValue: ''
        },
        project_intro: {
          type: Sequelize.STRING(500),
          allowNull: true,
          defaultValue: ''
        },
        create_user: {
          type: Sequelize.INTEGER(11),
          allowNull: true,
          defaultValue: '0'
        },
        is_del: {
          type: Sequelize.INTEGER(1),
          allowNull: true,
          defaultValue: '0'
        },
        is_public: {
          type: Sequelize.INTEGER(1),
          allowNull: true,
          defaultValue: '1'
        },
        create_role: {
          type: Sequelize.INTEGER(11),
          allowNull: true,
          defaultValue: '0'
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, {
        engine: 'InnoDB',
        charset: 'utf8'
      }),
      queryInterface.createTable('bi_purviews', {
        id: {
          type: Sequelize.STRING(20),
          allowNull: false,
          primaryKey: true
        },
        purview_name: {
          type: Sequelize.STRING(200),
          allowNull: true
        },
        purview_level: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        purview_parent: {
          type: Sequelize.STRING(200),
          allowNull: true
        },
        create_user: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        is_del: {
          type: Sequelize.INTEGER(1),
          allowNull: true,
          defaultValue: '0'
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, {
        engine: 'InnoDB',
        charset: 'utf8'
      }),
      queryInterface.createTable('bi_role_database_filter_relation', {
        id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        role_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        database_filter_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, {
        engine: 'InnoDB',
        charset: 'utf8'
      }),
      queryInterface.createTable('bi_role_purviews', {
        id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        role_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        purview_id: {
          type: Sequelize.STRING(20),
          allowNull: true
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, {
        engine: 'InnoDB',
        charset: 'utf8'
      }),
      queryInterface.createTable('bi_roles', {
        id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        role_name: {
          type: Sequelize.STRING(200),
          allowNull: true
        },
        shops_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        create_user: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        is_del: {
          type: Sequelize.INTEGER(1),
          allowNull: true,
          defaultValue: '0'
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, {
        engine: 'InnoDB',
        charset: 'utf8'
      }),
      queryInterface.createTable('bi_user_database_filter', {
        id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        user_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        database_filter_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        filter_value: {
          type: Sequelize.STRING(200),
          allowNull: true
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, {
        engine: 'InnoDB',
        charset: 'utf8'
      }),
      queryInterface.createTable('bi_users', {
        id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        role_id: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        user_name: {
          type: Sequelize.STRING(200),
          allowNull: true
        },
        user_pwd: {
          type: Sequelize.STRING(200),
          allowNull: true
        },
        real_name: {
          type: Sequelize.STRING(200),
          allowNull: true
        },
        email: {
          type: Sequelize.STRING(200),
          allowNull: true
        },
        status: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        create_user: {
          type: Sequelize.INTEGER(11),
          allowNull: true
        },
        is_del: {
          type: Sequelize.INTEGER(1),
          allowNull: true
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, {
        engine: 'InnoDB',
        charset: 'utf8'
      }),
    ]);
  },

  down: () => {
  }
};
