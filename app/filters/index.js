import Vue from 'vue';
import CellFormat from './cell-format';
import TimeFormat from './time-format';


Vue.filter('cell-format', CellFormat);
Vue.filter('time-format', TimeFormat);
