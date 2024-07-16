import Vue from 'vue';

// Text
import { plural } from 'assets/js/utils/text-utils';

Vue.filter('plural', plural);

// Numbers
import {
    leadingZero,
    prettyPhone,
    roundToMillions,
    splitThousands,
} from 'assets/js/utils/numbers-utils';

Vue.filter('leadingZero', leadingZero);
Vue.filter('splitThousands', splitThousands);
Vue.filter('roundToMillions', roundToMillions);
Vue.filter('prettyPhone', prettyPhone);
