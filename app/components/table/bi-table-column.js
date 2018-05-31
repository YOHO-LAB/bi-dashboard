export default {
  name: 'BiTableColumn',
  props: {
    prop: String,
    label: String,
    width: Number
  },
  render(h) {
    return h('div', this.$slots.defaults);
  }
};
