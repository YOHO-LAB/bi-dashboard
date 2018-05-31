import BiTableCell from './bi-table-cell';

export default {
  name: 'BiTableBody',
  props: {
    columnsData: Array,
    rows: {
      type: Array,
      default() {
        return [];
      }
    },
    width: Number,
  },
  computed: {
    style() {
      return {
        width: `${this.width}px`,
      };
    },
    tableStyle() {
      return {
        width: `${this.width}px`,
        marginBottom: '20px'
      };
    }
  },
  components: {BiTableCell},
  render() {
    return (
      <div class="bi-table-body" style={this.style}>
        <table cellspacing="0" cellpadding="0" border="0" style={this.tableStyle}>
          <colgroup>
            {this.columnsData.map(col => {
              return (
                <col width={col.width} />
              );
            })}
          </colgroup>
          <tbody>
            {this.rows.map(row => {
              return (
                <tr>
                  {
                    this.columnsData.map(col => {
                      return (
                        <bi-table-cell row={row} prop={col.prop} format={col.format}></bi-table-cell>
                      );
                    })
                  }
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
};
