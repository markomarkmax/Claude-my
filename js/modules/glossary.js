/**
 * Glossary of mortgage terms with interactive tooltips
 */
const Glossary = {
    terms: {
        'DTI': {
            short: 'Debt-to-Income',
            full: 'Pomer celkového dlhu k príjmu. NBS stanovuje limit 8-násobok čistého ročného príjmu. Pre mladých do 35 rokov môžu banky udeliť výnimku na 9-násobok (max 5% výnimiek).'
        },
        'DSTI': {
            short: 'Debt Service-to-Income',
            full: 'Pomer mesačných splátok k príjmu. Splátky nesmú presiahnuť 60% z (čistý príjem − životné minimum). Banka počíta so stress testom (aktuálna sadzba + 2%, min. 5%).'
        },
        'LTV': {
            short: 'Loan-to-Value',
            full: 'Pomer výšky úveru k hodnote nehnuteľnosti. Štandardne max 80%, s prirážkou až 90%. Pozemky 50–80% podľa banky a stavebného povolenia.'
        },
        'Stress test': {
            short: 'Záťažová skúška',
            full: 'Banka overuje, či klient zvládne splátky aj pri zvýšení úrokovej sadzby o 2% (alebo min. 5%). Slúži na ochranu pred rastom úrokov pri refixácii.'
        },
        'Fixácia': {
            short: 'Fixná úroková sadzba',
            full: 'Obdobie, počas ktorého sa úroková sadzba nemení (1, 3, 5, 10, 15 alebo 20 rokov). Po skončení fixácie banka ponúkne novú sadzbu – klient môže refinancovať.'
        },
        'Anuita': {
            short: 'Mesačná splátka',
            full: 'Stála mesačná splátka počas fixačného obdobia. Skladá sa z istiny (rastie) a úrokov (klesá). Vzorec: M = P × [r(1+r)^n] / [(1+r)^n − 1].'
        },
        'RPMN': {
            short: 'Ročná percentuálna miera nákladov',
            full: 'Celková cena úveru vyjadrená v percentách ročne. Zahŕňa úroky aj všetky poplatky (spracovanie, ohodnotenie, poistenie). Umožňuje reálne porovnanie ponúk.'
        },
        'Refixácia': {
            short: 'Zmena úrokovej sadzby',
            full: 'Po skončení fixačného obdobia banka ponúkne novú sadzbu. Klient môže súhlasiť, alebo refinancovať úver v inej banke bez poplatku.'
        },
        'Životné minimum': {
            short: 'ŽM – základná suma pre DSTI',
            full: 'Suma, ktorú banka odpočíta od príjmu pred výpočtom DSTI. Plnoletá osoba: 284,13 EUR, ďalší dospelý: 198,22 EUR, dieťa: 129,74 EUR (platné od 1.7.2025).'
        },
        'Cap Rate': {
            short: 'Kapitalizačná miera',
            full: 'Pomer čistého ročného príjmu z nehnuteľnosti k jej hodnote. Ukazuje výnosnosť investície bez ohľadu na financovanie. Dobré hodnoty: 4–8%.'
        },
        'IRR': {
            short: 'Internal Rate of Return',
            full: 'Vnútorné výnosové percento. Zohľadňuje časovú hodnotu peňazí a všetky cash flow (počiatočná investícia, ročné príjmy, predaj). Umožňuje porovnanie s inými investíciami.'
        },
        'ROI': {
            short: 'Return on Investment',
            full: 'Návratnosť investície v percentách. Výpočet: (celkový zisk − počiatočná investícia) / počiatočná investícia × 100.'
        }
    },

    /**
     * Initialize tooltips on elements with data-glossary attribute
     */
    init() {
        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('[data-glossary]');
            if (!target) return;
            this.showTooltip(target);
        });

        document.addEventListener('mouseout', (e) => {
            const target = e.target.closest('[data-glossary]');
            if (!target) return;
            this.hideTooltip();
        });

        // Also handle click on mobile
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-glossary]');
            if (target) {
                e.preventDefault();
                this.showTooltip(target);
            } else {
                this.hideTooltip();
            }
        });
    },

    showTooltip(element) {
        this.hideTooltip();
        const term = element.dataset.glossary;
        const entry = this.terms[term];
        if (!entry) return;

        const tooltip = Helpers.create('div', {
            className: 'glossary-tooltip',
            innerHTML: `<strong>${term}</strong> (${entry.short})<br>${entry.full}`
        });

        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.top = (rect.bottom + window.scrollY + 8) + 'px';
        tooltip.style.left = Math.max(8, rect.left + window.scrollX - 100) + 'px';

        // Keep in viewport
        requestAnimationFrame(() => {
            const tooltipRect = tooltip.getBoundingClientRect();
            if (tooltipRect.right > window.innerWidth - 8) {
                tooltip.style.left = (window.innerWidth - tooltipRect.width - 8) + 'px';
            }
        });
    },

    hideTooltip() {
        document.querySelectorAll('.glossary-tooltip').forEach(t => t.remove());
    },

    /**
     * Render full glossary page
     */
    render() {
        const container = Helpers.$('#glossary-content');
        if (!container) return;

        let html = '<div class="glossary-list">';
        for (const [term, entry] of Object.entries(this.terms)) {
            html += `
            <div class="glossary-item">
                <h4>${term} <span class="glossary-short">(${entry.short})</span></h4>
                <p>${entry.full}</p>
            </div>`;
        }
        html += '</div>';
        container.innerHTML = html;
    }
};
