export function lockBody() {
    console.warn('lockBody устарел, используйте disablePageScroll. Документация: https://github.com/FL3NKEY/scroll-lock/blob/master/README.RU.md');
}

export function unlockBody() {
    console.warn('unlockBody устарел, используйте enablePageScroll. Документация: https://github.com/FL3NKEY/scroll-lock/blob/master/README.RU.md');
}

export function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;

        function later() {
            timeout = null;

            if (!immediate) {
                func.apply(context, args);
            }
        }

        const callNow = immediate && !timeout;

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);

        if (callNow) {
            func.apply(context, args);
        }
    };
}

/* eslint-disable */
export function throttle(func, ms) {
    let isThrottled = false;
    let savedArgs;
    let savedThis;

    function wrapper() {
        if (isThrottled) {
            savedArgs = arguments;
            savedThis = this;
            return;
        }

        func.apply(this, arguments);

        isThrottled = true;

        setTimeout(function() {
            isThrottled = false;
            if (savedArgs) {
                wrapper.apply(savedThis, savedArgs);
                savedArgs = savedThis = null;
            }
        }, ms);
    }

    return wrapper;
}

export function remToPx(rem) {
    return parseFloat(rem) * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

export function scrollToHorizontalCenter(parentBlock, childBlock) {
    const width = childBlock?.getBoundingClientRect()?.width;

    if (parentBlock && width) {
        parentBlock.scrollLeft = width / 2 - window.innerWidth / 2;
    }
}
/* eslint-enable */
