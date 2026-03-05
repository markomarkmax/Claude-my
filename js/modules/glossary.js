/**
 * Glossary of mortgage terms with interactive tooltips
 */
const Glossary = {
    terms: {
        'DTI': {
            short: 'Debt-to-Income',
            full: 'Pomer celkoveho dlhu k prijmu. NBS stanovuje limit 8-nasobok cisteho rocneho prijmu. Pre mladych do 35 rokov mozu banky udelit vynimku na 9-nasobok (max 5% vynimiek).'
        },
        'DSTI': {
            short: 'Debt Service-to-Income',
            full: 'Pomer mesacnych splatok k prijmu. Splatky nesmiu presianut 60% z (cisty prijem - zivotne minimum). Banka pocita so stress testom (aktualna sadzba + 2%, min. 5%).'
        },
        'LTV': {
            short: 'Loan-to-Value',
            full: 'Pomer vysky uveru k hodnote nehnutelnosti. Standardne max 80%, s prirazkou az 90%. Pozemky 50-80% podla banky a stavebneho povolenia.'
        },
        'Stress test': {
            short: 'Zatazova skuska',
            full: 'Banka overuje, ci klient zvladne splatky aj pri zvyseni urokovej sadzby o 2% (alebo min. 5%). Sluzi na ochranu pred rastom urokov pri refixacii.'
        },
        'Fixacia': {
            short: 'Fixna urokova sadzba',
            full: 'Obdobie, pocas ktoreho sa urokova sadzba nemeni (1, 3, 5, 10, 15 alebo 20 rokov). Po skonceni fixacie banka ponukne novu sadzbu - klient moze refinancovat.'
        },
        'Anuitna splatka': {
            short: 'Mesacna splatka',
            full: 'Stala mesacna splatka pocas fixacneho obdobia. Sklada sa z istiny (rastie) a urokov (klesa). Vzorec: M = P * [r(1+r)^n] / [(1+r)^n - 1].'
        },
        'RPMN': {
            short: 'Rocna percentualna miera nakladov',
            full: 'Celkova cena uveru vyjadrena v percentach rocne. Zahrna uroky aj vsetky poplatky (spracovanie, ohodnotenie, poistenie). Umoznuje realne porovnanie ponuk.'
        },
        'Refixacia': {
            short: 'Zmena urokovej sadzby',
            full: 'Po skonceni fixacneho obdobia banka ponukne novu sadzbu. Klient moze suhlasit, alebo refinancovat uver v inej banke bez poplatku.'
        },
        'Zivotne minimum': {
            short: 'ZM - zakladna suma pre DSTI',
            full: 'Suma, ktoru banka odpocita od prijmu pred vypoctom DSTI. Plnoleta osoba: 284,13 EUR, dalsi dospely: 198,22 EUR, dieta: 129,74 EUR (platne od 1.7.2025).'
        },
        'Cap Rate': {
            short: 'Kapitalizacna miera',
            full: 'Pomer cisteho rocneho prijmu z nehnutelnosti k jej hodnote. Ukazuje vynosnost investicie bez ohadu na financovanie. Dobre hodnoty: 4-8%.'
        },
        'IRR': {
            short: 'Internal Rate of Return',
            full: 'Vnutorne vynosove percento. Zohladnuje casovu hodnotu penazi a vsetky cash flow (pociatocna investicia, rocne prijmy, predaj). Umoznuje porovnanie s inymi investiciami.'
        },
        'ROI': {
            short: 'Return on Investment',
            full: 'Navratnost investicie v percentach. Vypocet: (celkovy zisk - pociatocna investicia) / pociatocna investicia * 100.'
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
