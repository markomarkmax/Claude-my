/**
 * DOM utilities and helpers
 */
const Helpers = {
    $(selector, parent = document) {
        return parent.querySelector(selector);
    },

    $$(selector, parent = document) {
        return Array.from(parent.querySelectorAll(selector));
    },

    create(tag, attrs = {}, children = []) {
        const el = document.createElement(tag);
        Object.entries(attrs).forEach(([key, value]) => {
            if (key === 'className') el.className = value;
            else if (key === 'textContent') el.textContent = value;
            else if (key === 'innerHTML') el.innerHTML = value;
            else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
            else if (key === 'dataset') Object.assign(el.dataset, value);
            else el.setAttribute(key, value);
        });
        children.forEach(child => {
            if (typeof child === 'string') el.appendChild(document.createTextNode(child));
            else if (child) el.appendChild(child);
        });
        return el;
    },

    debounce(fn, delay = CONFIG.UI.debounceDelay) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    throttle(fn, limit = 100) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    show(el) {
        if (el) el.classList.remove('hidden');
    },

    hide(el) {
        if (el) el.classList.add('hidden');
    },

    toggle(el, show) {
        if (el) el.classList.toggle('hidden', !show);
    },

    animate(el, className) {
        el.classList.add(className);
        el.addEventListener('animationend', () => el.classList.remove(className), { once: true });
    },

    scrollTo(el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    parseNumber(value) {
        if (typeof value === 'number') return value;
        if (!value) return 0;
        return parseFloat(String(value).replace(/\s/g, '').replace(',', '.')) || 0;
    }
};
