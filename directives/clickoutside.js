const version = require('vue').version || require('vue').default.version;
const isVue3 = /^3\./.test(version);

const directiveHooks = {
    beforeMount: isVue3 ? 'beforeMount' : 'bind',
    updated: isVue3 ? 'updated' : 'update',
    unmounted: isVue3 ? 'unmounted' : 'unbind',
};

const HANDLERS_PROPERTY = '__v-click-outside';
const HAS_WINDOWS = typeof window !== 'undefined';
const HAS_NAVIGATOR = typeof navigator !== 'undefined';
const IS_TOUCH =
    HAS_WINDOWS &&
    ('ontouchstart' in window ||
        HAS_NAVIGATOR && navigator.msMaxTouchPoints > 0);
const EVENTS = IS_TOUCH ? ['touchstart'] : ['mousedown'];

function processDirectiveArguments(bindingValue) {
    const isFunction = typeof bindingValue === 'function';
    if (!isFunction && typeof bindingValue !== 'object') {
        throw new Error('v-click-outside: Binding value must be a function or an object');
    }

    return {
        handler: isFunction ? bindingValue : bindingValue.handler,
        middleware: bindingValue.middleware || (item => item),
        events: bindingValue.events || EVENTS,
        isActive: !(bindingValue.isActive === false),
        detectIframe: !(bindingValue.detectIframe === false),
        capture: Boolean(bindingValue.capture),
    };
}

function execHandler({ event, handler, middleware }) {
    if (middleware(event)) {
        handler(event);
    }
}

function onFauxIframeClick({ el, event, handler, middleware }) {
    setTimeout(() => {
        const { activeElement } = document;
        if (
            activeElement &&
            activeElement.tagName === 'IFRAME' &&
            !el.contains(activeElement)
        ) {
            execHandler({ event, handler, middleware });
        }
    }, 0);
}

function onEvent({ el, event, handler, middleware }) {
    const path = event.composedPath && event.composedPath() || event.path;
    const isClickOutside = path
        ? path.indexOf(el) < 0
        : !el.contains(event.target);

    if (!isClickOutside) {
        return;
    }

    execHandler({ event, handler, middleware });
}

function bind(el, { value }) {
    const {
        events,
        handler,
        middleware,
        isActive,
        detectIframe,
        capture,
    } = processDirectiveArguments(value);
    if (!isActive) {
        return;
    }

    el[HANDLERS_PROPERTY] = events.map(eventName => ({
        event: eventName,
        srcTarget: document.documentElement,
        handler: event => onEvent({ el, event, handler, middleware }),
        capture,
    }));

    if (detectIframe) {
        const detectIframeEvent = {
            event: 'blur',
            srcTarget: window,
            handler: event => onFauxIframeClick({ el, event, handler, middleware }),
            capture,
        };

        el[HANDLERS_PROPERTY] = [...el[HANDLERS_PROPERTY], detectIframeEvent];
    }

    el[HANDLERS_PROPERTY].forEach(({ event, srcTarget, handler }) => setTimeout(() => {
        if (!el[HANDLERS_PROPERTY]) {
            return;
        }
        srcTarget.addEventListener(event, handler, capture);
    }, 0));
}

function unbind(el) {
    const handlers = el[HANDLERS_PROPERTY] || [];
    handlers.forEach(({ event, srcTarget, handler, capture }) => srcTarget.removeEventListener(event, handler, capture));
    delete el[HANDLERS_PROPERTY];
}

function update(el, { value, oldValue }) {
    if (JSON.stringify(value) === JSON.stringify(oldValue)) {
        return;
    }
    unbind(el);
    bind(el, { value });
}

const directive = {
    [directiveHooks.beforeMount]: bind,
    [directiveHooks.updated]: update,
    [directiveHooks.unmounted]: unbind,
};

export default HAS_WINDOWS ? directive : {};
