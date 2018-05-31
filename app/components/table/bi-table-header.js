import {Icon} from 'iview';

export default {
  name: 'BiTableHeader',
  props: {
    columnsData: {
      type: Array
    },
    buildColumns: {
      type: Array
    },
    width: Number
  },
  computed: {
    style() {
      return {width: `${this.width}px`};
    }
  },
  components: {Icon},
  methods: {
    sort(column, order) {
      const prop = column.value.prop;
      const type = column.sort;

      if (order === type) {
        order = '';
      }

      this.$emit('sort-change', {column: prop, order});
    }
  },
  render() {
    return (
      <div class="bi-table-header" style={this.style}>
        <table cellspacing="0" cellpadding="0" border="0" style={this.style}>
          <colgroup>
            {this.columnsData.map(col => {
              return (
                <col width={col.width} />
              );
            })}
          </colgroup>
          <thead class="is-group has-gutter">
            {this.buildColumns.map(rows => {
              return (
                <tr>
                  {rows.map(column => {
                    return (
                      <th colspan={column.colspan} rowspan={column.rowspan}>
                        <div class="cell">
                          {column.slot ? column.slot : column.value.label}
                          {column.deep ? (
                            <div class="sort-icon">
                              <Icon
                                type="arrow-up-b"
                                class={{on: column.sort === 'asc'}}
                                nativeOnClick={() => this.sort(column, 'asc')}></Icon>
                              <Icon
                                type="arrow-down-b"
                                class={{on: column.sort === 'desc'}}
                                nativeOnClick={() => this.sort(column, 'desc')}></Icon>
                            </div>
                          ) : ''}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>
        </table>
      </div>
    );
  }
};
