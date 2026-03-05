/**
 * Investment module - ROI, IRR, cash flow, taxes, break-even, comparison
 */
const Investment = {
    /**
     * Calculate monthly rental cash flow
     */
    monthlyCashFlow(params) {
        const {
            monthlyRent,
            monthlyMortgage,
            monthlyEnergies = 0,
            monthlyManagement = 0,
            monthlyInsurance = 0,
            vacancyRate = CONFIG.INVESTMENT.vacancyRate
        } = params;

        const effectiveRent = monthlyRent * (1 - vacancyRate / 100);
        const totalExpenses = monthlyMortgage + monthlyEnergies + monthlyManagement + monthlyInsurance;
        const netCashFlow = effectiveRent - totalExpenses;

        return {
            grossRent: monthlyRent,
            effectiveRent,
            totalExpenses,
            netCashFlow,
            cashFlowPositive: netCashFlow > 0
        };
    },

    /**
     * Calculate annual rental income tax
     * Two methods: flat-rate (60%) vs actual expenses + depreciation
     */
    calculateTax(annualRent, annualExpenses, propertyValue, landRatio = 0.2) {
        const cfg = CONFIG.INVESTMENT;
        const exemption = 500; // EUR annual exemption for rental income

        const taxableBase = Math.max(0, annualRent - exemption);

        // Method 1: Flat-rate 60% expenses
        const flatExpenses = taxableBase * (cfg.flatExpenseRate / 100);
        const flatTaxBase = taxableBase - flatExpenses;
        const flatTax = Math.max(0, flatTaxBase) * (cfg.taxRate / 100);

        // Method 2: Actual expenses + depreciation
        const buildingValue = propertyValue * (1 - landRatio);
        const annualDepreciation = buildingValue / cfg.depreciationYears;
        const actualTaxBase = taxableBase - annualExpenses - annualDepreciation;
        const actualTax = Math.max(0, actualTaxBase) * (cfg.taxRate / 100);

        const betterMethod = flatTax <= actualTax ? 'flat' : 'actual';

        return {
            flatRate: { taxBase: flatTaxBase, tax: flatTax },
            actual: { taxBase: actualTaxBase, tax: actualTax, depreciation: annualDepreciation },
            betterMethod,
            optimalTax: Math.min(flatTax, actualTax),
            exemption
        };
    },

    /**
     * Calculate Cap Rate (capitalization rate)
     */
    capRate(annualNetIncome, propertyValue) {
        if (propertyValue <= 0) return 0;
        return (annualNetIncome / propertyValue) * 100;
    },

    /**
     * Calculate ROI (Return on Investment)
     */
    roi(totalReturn, totalInvestment) {
        if (totalInvestment <= 0) return 0;
        return ((totalReturn - totalInvestment) / totalInvestment) * 100;
    },

    /**
     * Calculate IRR using Newton-Raphson
     * cashFlows: array where [0] = initial investment (negative), [1..n] = annual flows
     */
    irr(cashFlows, guess = 0.1, maxIter = 100, precision = 0.0001) {
        let rate = guess;

        for (let i = 0; i < maxIter; i++) {
            let npv = 0;
            let dnpv = 0;

            for (let t = 0; t < cashFlows.length; t++) {
                const factor = Math.pow(1 + rate, t);
                npv += cashFlows[t] / factor;
                if (t > 0) {
                    dnpv -= t * cashFlows[t] / (factor * (1 + rate));
                }
            }

            if (Math.abs(npv) < precision) return rate * 100;

            const newRate = rate - npv / dnpv;
            if (isNaN(newRate) || !isFinite(newRate)) return null;
            rate = newRate;
        }

        return rate * 100;
    },

    /**
     * Full investment analysis over holding period
     */
    analyze(params) {
        const {
            propertyValue,
            ownFunds,
            monthlyRent,
            monthlyMortgage,
            monthlyEnergies = 100,
            monthlyInsurance = 30,
            annualRate,
            loanTermYears,
            holdingYears = 10,
            managementCostRate = CONFIG.INVESTMENT.managementCostRate,
            vacancyRate = CONFIG.INVESTMENT.vacancyRate,
            scenarios = CONFIG.INVESTMENT.propertyAppreciation
        } = params;

        const loanAmount = propertyValue - ownFunds;
        const monthlyManagement = monthlyRent * (managementCostRate / 100);

        // Monthly cash flow
        const cf = this.monthlyCashFlow({
            monthlyRent,
            monthlyMortgage,
            monthlyEnergies,
            monthlyManagement,
            monthlyInsurance,
            vacancyRate
        });

        // Annual figures
        const annualRent = monthlyRent * 12 * (1 - vacancyRate / 100);
        const annualExpenses = (monthlyEnergies + monthlyManagement + monthlyInsurance) * 12;
        const annualMortgage = monthlyMortgage * 12;

        // Tax calculation
        const tax = this.calculateTax(monthlyRent * 12, annualExpenses, propertyValue);

        // Annual net cash flow after tax
        const annualNetCashFlow = annualRent - annualExpenses - annualMortgage - tax.optimalTax;

        // Cap Rate
        const capRateValue = this.capRate(annualRent - annualExpenses, propertyValue);

        // Scenario analysis
        const scenarioResults = {};
        for (const [name, appreciation] of Object.entries(scenarios)) {
            const futureValue = propertyValue * Math.pow(1 + appreciation / 100, holdingYears);

            // Remaining mortgage balance after holding period
            const schedule = Amortization.generate(loanAmount, annualRate, loanTermYears * 12);
            const monthsHeld = Math.min(holdingYears * 12, schedule.length);
            const remainingBalance = monthsHeld < schedule.length ? schedule[monthsHeld - 1].balance : 0;

            // Total cash flows
            const totalRentalIncome = annualNetCashFlow * holdingYears;
            const saleProceeds = futureValue - remainingBalance;
            const totalReturn = totalRentalIncome + saleProceeds;
            const roiValue = this.roi(totalReturn, ownFunds);

            // IRR calculation
            const cashFlows = [-ownFunds];
            for (let y = 1; y < holdingYears; y++) {
                cashFlows.push(annualNetCashFlow);
            }
            cashFlows.push(annualNetCashFlow + saleProceeds);
            const irrValue = this.irr(cashFlows);

            scenarioResults[name] = {
                appreciation,
                futureValue,
                remainingBalance,
                totalRentalIncome,
                saleProceeds,
                totalReturn,
                roi: roiValue,
                irr: irrValue,
                cashFlows
            };
        }

        // Break-even: months until cumulative cash flow turns positive
        let cumulative = -ownFunds;
        let breakEvenMonths = null;
        for (let m = 1; m <= holdingYears * 12; m++) {
            cumulative += cf.netCashFlow - (tax.optimalTax / 12);
            if (cumulative >= 0 && breakEvenMonths === null) {
                breakEvenMonths = m;
            }
        }

        // Alternative investments comparison
        const alternatives = this.compareAlternatives(ownFunds, holdingYears);

        return {
            monthlyCashFlow: cf,
            annualNetCashFlow,
            tax,
            capRate: capRateValue,
            scenarios: scenarioResults,
            breakEvenMonths,
            alternatives,
            params
        };
    },

    /**
     * Compare with alternative investments
     */
    compareAlternatives(investmentAmount, years) {
        const alts = CONFIG.INVESTMENT.alternatives;
        const results = {};

        for (const [name, rate] of Object.entries(alts)) {
            const futureValue = investmentAmount * Math.pow(1 + rate / 100, years);
            const totalReturn = futureValue - investmentAmount;
            const annualReturn = totalReturn / years;

            results[name] = {
                rate,
                futureValue,
                totalReturn,
                annualReturn
            };
        }

        return results;
    },

    /**
     * Render investment results
     */
    render(analysis) {
        const container = Helpers.$('#investment-results');
        if (!container) return;

        const cf = analysis.monthlyCashFlow;
        const tax = analysis.tax;

        let html = `
        <div class="investment-section">
            <h3>Mesacny cash flow</h3>
            <div class="investment-grid">
                <div class="inv-metric ${cf.cashFlowPositive ? 'positive' : 'negative'}">
                    <span class="metric-label">Cisty mesacny cash flow</span>
                    <span class="metric-value">${Formatting.eur(cf.netCashFlow)}</span>
                </div>
                <div class="inv-metric">
                    <span class="metric-label">Efektivny najem</span>
                    <span class="metric-value">${Formatting.eur(cf.effectiveRent)}</span>
                </div>
                <div class="inv-metric">
                    <span class="metric-label">Celkove vydavky</span>
                    <span class="metric-value">${Formatting.eur(cf.totalExpenses)}</span>
                </div>
            </div>
        </div>

        <div class="investment-section">
            <h3>Dane z prenajmu (rocne)</h3>
            <div class="investment-grid">
                <div class="inv-metric">
                    <span class="metric-label">Pausalne vydavky (60%)</span>
                    <span class="metric-value">Dan: ${Formatting.eur(tax.flatRate.tax)}</span>
                </div>
                <div class="inv-metric">
                    <span class="metric-label">Skutocne vydavky + odpisy</span>
                    <span class="metric-value">Dan: ${Formatting.eur(tax.actual.tax)}</span>
                </div>
                <div class="inv-metric highlight">
                    <span class="metric-label">Lepsia metoda</span>
                    <span class="metric-value">${tax.betterMethod === 'flat' ? 'Pausalne' : 'Skutocne'} (${Formatting.eur(tax.optimalTax)}/rok)</span>
                </div>
            </div>
        </div>

        <div class="investment-section">
            <h3>Kapitalizacna miera (Cap Rate)</h3>
            <div class="inv-metric">
                <span class="metric-value big">${Formatting.percent(analysis.capRate)}</span>
            </div>
        </div>

        <div class="investment-section">
            <h3>Scenare (${analysis.params.holdingYears || 10} rokov)</h3>
            <table class="comparison-table">
                <thead><tr>
                    <th>Scenar</th><th>Rast ceny</th><th>Buducnost</th><th>ROI</th><th>IRR</th>
                </tr></thead>
                <tbody>
                ${Object.entries(analysis.scenarios).map(([name, s]) => `
                    <tr>
                        <td>${name === 'optimistic' ? 'Optimisticky' : name === 'realistic' ? 'Realisticky' : 'Pesimisticky'}</td>
                        <td>${Formatting.percent(s.appreciation)}/rok</td>
                        <td>${Formatting.eurShort(s.futureValue)}</td>
                        <td>${Formatting.percent(s.roi, 1)}</td>
                        <td>${s.irr != null ? Formatting.percent(s.irr, 1) : 'N/A'}</td>
                    </tr>
                `).join('')}
                </tbody>
            </table>
        </div>

        ${analysis.breakEvenMonths != null ? `
        <div class="investment-section">
            <h3>Break-even</h3>
            <p>Investicia sa vrati za <strong>${Formatting.months(analysis.breakEvenMonths)}</strong> (${(analysis.breakEvenMonths / 12).toFixed(1)} roka).</p>
        </div>` : '<div class="investment-section"><h3>Break-even</h3><p>Investicia sa z cash flow nevrati v danom obdobi.</p></div>'}

        <div class="investment-section">
            <h3>Porovnanie s alternativami</h3>
            <table class="comparison-table">
                <thead><tr><th>Investicia</th><th>Vynosnost</th><th>Hodnota</th><th>Zisk</th></tr></thead>
                <tbody>
                ${Object.entries(analysis.alternatives).map(([name, a]) => `
                    <tr>
                        <td>${name === 'etf' ? 'ETF fondy' : name === 'bonds' ? 'Dlhopisy' : 'Terminovany vklad'}</td>
                        <td>${Formatting.percent(a.rate)}/rok</td>
                        <td>${Formatting.eurShort(a.futureValue)}</td>
                        <td>${Formatting.eurShort(a.totalReturn)}</td>
                    </tr>
                `).join('')}
                </tbody>
            </table>
        </div>`;

        container.innerHTML = html;
    }
};
