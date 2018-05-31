import _ from 'lodash';
import cellFormat from 'filters/cell-format';

export default {
  name: 'BiTableCell',
  props: {
    row: Object,
    prop: String,
    format: String
  },
  computed: {
    value() {
      let val = _.get(this.row, this.prop);

      switch (this.format) {
        case 'PERCENT':
          val = `${_.round(val * 100, 2) || 0}%`;
          break;
        default:
          break;
      }
      return val;
    }
  },
  render() {
    return (
      <td class="bi-table-cell">
        <div class="cell">{cellFormat(this.value)}</div>
      </td>
    );
  }
};
