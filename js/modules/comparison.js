/**
 * Bank comparison, filtering, ranking
 */
const Comparison = {
    currentResults: [],
    sortField: 'monthlyPayment',
    sortDirection: 'asc',

    /**
     * Display comparison results
     */
    render(results, mode = 'client') {
        this.currentResults = results;
        const container = Helpers.$('#comparison-results');
        if (!container) return;

        const limit = mode === 'client' ? 3 : results.length;
        const shown = results.slice(0, limit);

        let html = '<div class="comparison-grid">';

        shown.forEach((r, index) => {
            const rank = index + 1;
            const statusClass = r.approved ? 'status-approved' : 'status-rejected';
            const statusText = r.approved ? 'Schvalene' : 'Neschvalene';
            const bestClass = index === 0 && r.approved ? 'card-best' : '';

            html += `
            <div class="bank-card ${statusClass} ${bestClass}" data-bank="${r.bank.id}">
                <div class="bank-card-header" style="border-color: ${r.bank.color}">
                    <span class="bank-rank">#${rank}</span>
                    <h3 class="bank-name" style="color: ${r.bank.color}">${r.bank.name}</h3>
                    <span class="bank-status ${statusClass}">${statusText}</span>
                </div>
                <div class="bank-card-body">
                    <div class="bank-metric main-metric">
                        <span class="metric-label">Mesacna splatka</span>
                        <span class="metric-value">${Formatting.eur(r.monthlyPayment)}</span>
                    </div>
                    <div class="bank-metrics-grid">
                        <div class="bank-metric">
                            <span class="metric-label">Urokova sadzba</span>
                            <span class="metric-value">${Formatting.percent(r.effectiveRate)}</span>
                            ${r.ltvSurcharge > 0 ? `<span class="metric-note">zaklad ${Formatting.percent(r.baseRate)} + LTV prirazka ${Formatting.percent(r.ltvSurcharge)}</span>` : ''}
                        </div>
                        <div class="bank-metric">
                            <span class="metric-label">Celkove zaplatene uroky</span>
                            <span class="metric-value">${Formatting.eurShort(r.totalInterest)}</span>
                        </div>
                        <div class="bank-metric">
                            <span class="metric-label">Celkova suma</span>
                            <span class="metric-value">${Formatting.eurShort(r.totalPayment)}</span>
                        </div>
                        <div class="bank-metric">
                            <span class="metric-label">Max. hypoteka</span>
                            <span class="metric-value">${Formatting.eurShort(r.maxMortgage)}</span>
                        </div>
                        <div class="bank-metric">
                            <span class="metric-label">LTV</span>
                            <span class="metric-value">${Formatting.percent(r.actualLTV, 1)}</span>
                        </div>
                        <div class="bank-metric">
                            <span class="metric-label">Limitujuci faktor</span>
                            <span class="metric-value">${r.limitingFactor}</span>
                        </div>
                    </div>`;

            // Advisor mode: show extra details
            if (mode === 'advisor') {
                html += `
                    <div class="bank-details-extra">
                        <div class="bank-metric">
                            <span class="metric-label">DTI multiplikator</span>
                            <span class="metric-value">${r.dti.multiplier}x</span>
                        </div>
                        <div class="bank-metric">
                            <span class="metric-label">Max. splatka (DSTI)</span>
                            <span class="metric-value">${Formatting.eur(r.dsti.maxPayment)}</span>
                        </div>
                        <div class="bank-metric">
                            <span class="metric-label">Stress test sadzba</span>
                            <span class="metric-value">${Formatting.percent(r.dsti.stressRate)}</span>
                        </div>
                        <div class="bank-metric">
                            <span class="metric-label">Zivotne minimum</span>
                            <span class="metric-value">${Formatting.eur(r.dsti.livingMinimum)}</span>
                        </div>
                        <div class="bank-metric">
                            <span class="metric-label">Vek pri splatnosti</span>
                            <span class="metric-value">${r.ageAtMaturity} rokov</span>
                        </div>
                        ${r.bank.campaignNote ? `<div class="bank-campaign"><strong>Kampan:</strong> ${r.bank.campaignNote}</div>` : ''}
                        ${r.bank.campaignValidUntil ? `<div class="bank-campaign-date">Platnost do: ${Formatting.date(r.bank.campaignValidUntil)}</div>` : ''}
                    </div>`;
            }

            // Warnings
            if (r.warnings.length > 0) {
                html += '<div class="bank-warnings">';
                r.warnings.forEach(w => {
                    html += `<div class="warning-item">${w}</div>`;
                });
                html += '</div>';
            }

            html += `
                    <button class="btn btn-outline btn-detail" onclick="Comparison.showDetail('${r.bank.id}')">
                        Detail banky
                    </button>
                </div>
            </div>`;
        });

        html += '</div>';

        if (mode === 'client' && results.length > 3) {
            html += `<button class="btn btn-secondary show-all-btn" onclick="Comparison.showAll()">Zobrazit vsetky banky (${results.length})</button>`;
        }

        container.innerHTML = html;
    },

    /**
     * Show all banks
     */
    showAll() {
        this.render(this.currentResults, 'advisor');
    },

    /**
     * Show bank detail modal
     */
    showDetail(bankId) {
        const bank = getBankById(bankId);
        if (!bank) return;

        const result = this.currentResults.find(r => r.bank.id === bankId);

        let html = `
        <div class="modal-container">
        <div class="modal-header" style="border-color: ${bank.color}">
            <h2 style="color: ${bank.color}">${bank.name}</h2>
            <button class="modal-close" onclick="Comparison.closeDetail()">&times;</button>
        </div>
        <div class="modal-body">
            <h3>Urokove sadzby</h3>
            <table class="detail-table">
                <tr><th>Fixacia</th><th>Sadzba</th></tr>
                ${['1','3','5','10','15','20'].map(f => {
                    const rate = bank.rates['fix' + f];
                    const campaign = bank.campaignRates['fix' + f];
                    if (!rate) return '';
                    return `<tr><td>FIX ${f}</td><td>${campaign ? `<strong>${Formatting.percent(campaign)}</strong> <s>${Formatting.percent(rate)}</s>` : Formatting.percent(rate)}</td></tr>`;
                }).join('')}
            </table>

            ${bank.discounts.length > 0 ? `
            <h3>Zlavy</h3>
            <ul>${bank.discounts.map(d => `<li>${d.name}: ${d.value > 0 ? '+' : ''}${Formatting.percent(d.value)}</li>`).join('')}</ul>
            ` : ''}

            <h3>LTV limity</h3>
            <table class="detail-table">
                <tr><td>Standard</td><td>${bank.ltv.standard}%</td></tr>
                <tr><td>Maximum</td><td>${bank.ltv.max}%</td></tr>
                <tr><td>Prirazka nad ${bank.ltv.standard}%</td><td>+${Formatting.percent(bank.ltv.surchargeAbove80)}</td></tr>
                <tr><td>Pozemok</td><td>${bank.ltv.land}%</td></tr>
                <tr><td>Pozemok so SP</td><td>${bank.ltv.landWithPermit}%</td></tr>
            </table>

            <h3>Akceptacia prijmov</h3>
            <table class="detail-table">
                <tr><td>TPP</td><td>${bank.incomeAcceptance.tpp ? 'Ano' : 'Nie'}</td></tr>
                <tr><td>SZCO</td><td>${bank.incomeAcceptance.szco ? 'Ano' : 'Nie'}</td></tr>
                <tr><td>Dohoda o PP</td><td>${bank.incomeAcceptance.dohodaOPP ? 'Ano' : 'Nie'}</td></tr>
                <tr><td>Dochodok</td><td>${bank.incomeAcceptance.pension ? 'Ano' : 'Nie'}</td></tr>
                <tr><td>Materska</td><td>${bank.incomeAcceptance.maternity ? 'Ano' : 'Nie'}</td></tr>
                <tr><td>Prijem z prenajmu</td><td>${bank.incomeAcceptance.rental ? 'Ano' : 'Nie'}</td></tr>
                <tr><td>Prijem zo zahranicia</td><td>${bank.incomeAcceptance.abroad ? 'Ano' : 'Nie'}</td></tr>
                ${bank.incomeAcceptance.abroadNote ? `<tr><td colspan="2" class="note">${bank.incomeAcceptance.abroadNote}</td></tr>` : ''}
            </table>

            <h3>Poplatky</h3>
            <table class="detail-table">
                <tr><td>Spracovatelsky poplatok</td><td>${bank.fees.processing === 0 ? 'Zdarma' : Formatting.eur(bank.fees.processing)}</td></tr>
                <tr><td>Ohodnotenie nehnutelnosti</td><td>${bank.fees.propertyValuation === 0 ? 'Zdarma' : Formatting.eur(bank.fees.propertyValuation)}</td></tr>
                <tr><td>Mimoriadna splatka (free)</td><td>${bank.fees.extraPaymentFree}% rocne</td></tr>
            </table>

            <h3>Podmienky</h3>
            <table class="detail-table">
                <tr><td>Min. uver</td><td>${Formatting.eur(bank.minLoan, 0)}</td></tr>
                <tr><td>Splatnost</td><td>${bank.loanTerms.minYears} - ${bank.loanTerms.maxYears} rokov</td></tr>
                <tr><td>Max. vek pri splatnosti</td><td>${bank.loanTerms.maxAgeAtMaturity} rokov</td></tr>
            </table>

            ${bank.specialFeatures.length > 0 ? `
            <h3>Specialne vlastnosti</h3>
            <ul>${bank.specialFeatures.map(f => `<li>${f}</li>`).join('')}</ul>
            ` : ''}

            ${bank.notes ? `<p class="bank-note"><em>${bank.notes}</em></p>` : ''}
        </div>
        </div>`;

        const modal = Helpers.$('#bank-detail-modal');
        modal.innerHTML = html;
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    },

    closeDetail() {
        const modal = Helpers.$('#bank-detail-modal');
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    },

    initModal() {
        const modal = Helpers.$('#bank-detail-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeDetail();
            });
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeDetail();
        });
    },

    /**
     * Build comparison summary table (for advisor mode)
     */
    renderSummaryTable(results) {
        let html = '<table class="comparison-table"><thead><tr>';
        html += '<th>Banka</th><th>Sadzba</th><th>Splatka</th><th>Celk. uroky</th><th>Max. hypoteka</th><th>LTV</th><th>Status</th>';
        html += '</tr></thead><tbody>';

        for (const r of results) {
            const cls = r.approved ? '' : 'row-rejected';
            html += `<tr class="${cls}">`;
            html += `<td style="color:${r.bank.color};font-weight:600">${r.bank.shortName}</td>`;
            html += `<td>${Formatting.percent(r.effectiveRate)}</td>`;
            html += `<td>${Formatting.eur(r.monthlyPayment)}</td>`;
            html += `<td>${Formatting.eurShort(r.totalInterest)}</td>`;
            html += `<td>${Formatting.eurShort(r.maxMortgage)}</td>`;
            html += `<td>${Formatting.percent(r.actualLTV, 1)}</td>`;
            html += `<td><span class="${r.approved ? 'badge-ok' : 'badge-no'}">${r.approved ? 'OK' : 'X'}</span></td>`;
            html += '</tr>';
        }

        html += '</tbody></table>';
        return html;
    }
};
