import Vue from 'vue';

// Если уже добавлен плагин в /config/plugins, сюда дублировать не нужно.
import ClickOutside from '~/directives/clickoutside';

Vue.directive('clickoutside', ClickOutside);
