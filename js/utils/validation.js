/**
 * Input validation utilities
 */
const Validation = {
    isPositiveNumber(value) {
        const num = parseFloat(value);
        return !isNaN(num) && num > 0;
    },

    isNonNegativeNumber(value) {
        const num = parseFloat(value);
        return !isNaN(num) && num >= 0;
    },

    isInRange(value, min, max) {
        const num = parseFloat(value);
        return !isNaN(num) && num >= min && num <= max;
    },

    isInteger(value) {
        const num = parseFloat(value);
        return !isNaN(num) && Number.isInteger(num);
    },

    validateField(input, rules) {
        const value = input.value.trim();
        const errors = [];

        if (rules.required && value === '') {
            errors.push('Toto pole je povinne');
            return { valid: false, errors };
        }

        if (value === '' && !rules.required) {
            return { valid: true, errors: [] };
        }

        if (rules.type === 'number') {
            if (!this.isPositiveNumber(value) && !rules.allowZero) {
                errors.push('Zadajte kladne cislo');
            } else if (rules.allowZero && !this.isNonNegativeNumber(value)) {
                errors.push('Zadajte cislo >= 0');
            }

            const num = parseFloat(value);
            if (rules.min !== undefined && num < rules.min) {
                errors.push(`Minimum je ${Formatting.number(rules.min)}`);
            }
            if (rules.max !== undefined && num > rules.max) {
                errors.push(`Maximum je ${Formatting.number(rules.max)}`);
            }
        }

        if (rules.type === 'integer') {
            if (!this.isInteger(value)) {
                errors.push('Zadajte cele cislo');
            }
        }

        return { valid: errors.length === 0, errors };
    },

    showError(input, message) {
        input.classList.add('input-error');
        let errorEl = input.parentElement.querySelector('.field-error');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.className = 'field-error';
            input.parentElement.appendChild(errorEl);
        }
        errorEl.textContent = message;
    },

    clearError(input) {
        input.classList.remove('input-error');
        const errorEl = input.parentElement.querySelector('.field-error');
        if (errorEl) errorEl.remove();
    },

    clearAllErrors(container) {
        container.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        container.querySelectorAll('.field-error').forEach(el => el.remove());
    }
};
