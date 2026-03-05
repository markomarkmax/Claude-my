/**
 * Formatting utilities for EUR, percentages, dates
 */
const Formatting = {
    eur(value, decimals = 2) {
        if (value == null || isNaN(value)) return '0,00 EUR';
        return new Intl.NumberFormat('sk-SK', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value) + ' EUR';
    },

    eurShort(value) {
        if (value == null || isNaN(value)) return '0 EUR';
        if (Math.abs(value) >= 1000000) {
            return (value / 1000000).toFixed(1).replace('.', ',') + ' mil. EUR';
        }
        if (Math.abs(value) >= 1000) {
            return Math.round(value).toLocaleString('sk-SK') + ' EUR';
        }
        return this.eur(value, 0);
    },

    percent(value, decimals = 2) {
        if (value == null || isNaN(value)) return '0,00 %';
        return value.toFixed(decimals).replace('.', ',') + ' %';
    },

    number(value, decimals = 0) {
        if (value == null || isNaN(value)) return '0';
        return new Intl.NumberFormat('sk-SK', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    },

    years(value) {
        if (value === 1) return '1 rok';
        if (value >= 2 && value <= 4) return value + ' roky';
        return value + ' rokov';
    },

    months(value) {
        if (value === 1) return '1 mesiac';
        if (value >= 2 && value <= 4) return value + ' mesiace';
        return value + ' mesiacov';
    },

    date(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('sk-SK');
    }
};
