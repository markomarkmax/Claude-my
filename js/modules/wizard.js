/**
 * Wizard – 4 kroky s voľbou režimu pred krokom 1
 * Režim MAX:    Účel → Financie → Max výsledky → Plná analýza
 * Režim VERIFY: Účel → Nehnuteľnosť → Financie → Výsledky
 */
const Wizard = {
    currentStep: 0,
    totalSteps: 4,
    wizardMode: null,
    data: {},

    stepMap: {
        max:    { 1: 'step-1', 2: 'step-finances', 3: 'step-max-result', 4: 'step-4' },
        verify: { 1: 'step-1', 2: 'step-property',  3: 'step-finances',   4: 'step-4' }
    },

    stepLabels: {
        max:    { 1: 'Účel', 2: 'Financie', 3: 'Predbežné výsledky', 4: 'Plná analýza' },
        verify: { 1: 'Účel', 2: 'Nehnuteľnosť', 3: 'Financie', 4: 'Výsledky' }
    },

    init() {
        this.data.fixation = 5;
        this.data.propertyType = 'apartment';
        this.bindInputs();
        Helpers.show(Helpers.$('#step-mode-select'));
        Helpers.hide(Helpers.$('#wizard-stepper'));
    },

    selectMode(mode) {
        this.wizardMode = mode;
        this.data = { fixation: 5, propertyType: 'apartment' };

        Helpers.hide(Helpers.$('#step-mode-select'));
        Helpers.show(Helpers.$('#wizard-stepper'));

        const labels = this.stepLabels[mode];
        for (let i = 1; i <= 4; i++) {
            const el = Helpers.$(`#step-label-${i}`);
            if (el) el.textContent = labels[i];
        }

        this.showStep(1);
    },

    backToModeSelect() {
        this.wizardMode = null;
        Helpers.$$('.wizard-step').forEach(s => s.classList.add('hidden'));
        Helpers.hide(Helpers.$('#wizard-stepper'));
        Helpers.show(Helpers.$('#step-mode-select'));
        this.currentStep = 0;
    },

    showStep(step) {
        if (!this.wizardMode) return;

        Helpers.$$('.wizard-step').forEach(s => s.classList.add('hidden'));

        const stepId = this.stepMap[this.wizardMode][step];
        const stepEl = Helpers.$(`#${stepId}`);
        if (stepEl) stepEl.classList.remove('hidden');

        Helpers.$$('.step-indicator').forEach(ind => {
            const s = parseInt(ind.dataset.step);
            ind.classList.remove('active', 'completed');
            if (s === step) ind.classList.add('active');
            else if (s < step) ind.classList.add('completed');
        });

        this.currentStep = step;

        if (step === 3 && this.wizardMode === 'max') {
            this.calculateMax();
        }
        if (step === 4) {
            this.calculate();
        }
    },

    nextStep() {
        if (!this.validateCurrentStep()) return;
        this.collectStepData();
        if (this.currentStep < this.totalSteps) {
            this.showStep(this.currentStep + 1);
        }
    },

    prevStep() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    },

    bindInputs() {
        Helpers.$$('input[name="purpose"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.data.purpose = radio.value;
                this.updateConditionalFields();
            });
        });

        Helpers.$$('input[name="propertyType"]').forEach(radio => {
            radio.addEventListener('change', () => { this.data.propertyType = radio.value; });
        });

        Helpers.$$('input[name="incomeType"]').forEach(radio => {
            radio.addEventListener('change', () => { this.data.incomeType = radio.value; });
        });

        // LTV – step-property
        const propVal = Helpers.$('#propertyValue');
        const ownFnds = Helpers.$('#ownFunds');
        if (propVal && ownFnds) {
            const upd = Helpers.debounce(() => this.updateLTVIndicator('ltv-indicator', 'propertyValue', 'ownFunds'), 200);
            propVal.addEventListener('input', upd);
            ownFnds.addEventListener('input', upd);
        }

        // LTV – step-max-result
        const propValMax = Helpers.$('#propertyValueMax');
        const ownFndsMax = Helpers.$('#ownFundsMax');
        if (propValMax && ownFndsMax) {
            const upd = Helpers.debounce(() => this.updateLTVIndicator('ltv-indicator-max', 'propertyValueMax', 'ownFundsMax'), 200);
            propValMax.addEventListener('input', upd);
            ownFndsMax.addEventListener('input', upd);
        }

        Helpers.$$('.fix-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                Helpers.$$('.fix-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.data.fixation = parseInt(btn.dataset.fix);
            });
        });

        const coApplicant = Helpers.$('#hasCoApplicant');
        if (coApplicant) {
            coApplicant.addEventListener('change', () => {
                Helpers.toggle(Helpers.$('#coApplicantFields'), coApplicant.checked);
            });
        }

        const btnFull = Helpers.$('#btn-full-analysis');
        if (btnFull) {
            btnFull.addEventListener('click', () => {
                if (!this.validateMaxStep()) return;
                this.data.propertyValue = Helpers.parseNumber(Helpers.$('#propertyValueMax')?.value);
                this.data.ownFunds = Helpers.parseNumber(Helpers.$('#ownFundsMax')?.value);
                this.showStep(4);
            });
        }

        Helpers.$$('.wizard-next').forEach(btn => {
            btn.addEventListener('click', () => this.nextStep());
        });
        Helpers.$$('.wizard-back').forEach(btn => {
            btn.addEventListener('click', () => this.prevStep());
        });
        Helpers.$$('.step-indicator').forEach(ind => {
            ind.addEventListener('click', () => {
                const s = parseInt(ind.dataset.step);
                if (s < this.currentStep) this.showStep(s);
            });
        });
    },

    updateLTVIndicator(indicatorId, valueId, fundsId) {
        const value = Helpers.parseNumber(Helpers.$(`#${valueId}`)?.value);
        const funds = Helpers.parseNumber(Helpers.$(`#${fundsId}`)?.value);
        const indicator = Helpers.$(`#${indicatorId}`);
        if (!indicator || value <= 0) return;

        const ltv = Math.min(Math.max(((value - funds) / value) * 100, 0), 100);
        indicator.querySelector('.ltv-value').textContent = Formatting.percent(ltv, 1);

        const bar = indicator.querySelector('.ltv-bar-fill');
        bar.style.width = ltv + '%';
        bar.className = 'ltv-bar-fill';
        if (ltv <= 70) bar.classList.add('ltv-green');
        else if (ltv <= 80) bar.classList.add('ltv-yellow');
        else if (ltv <= 90) bar.classList.add('ltv-orange');
        else bar.classList.add('ltv-red');

        const info = indicator.querySelector('.ltv-info');
        if (ltv <= 80) info.textContent = 'Štandardné LTV – bez prirážky';
        else if (ltv <= 90) info.textContent = 'LTV nad 80 % – banka účtuje prirážku k sadzbe';
        else info.textContent = 'LTV nad 90 % – väčšina bánk neschváli';

        Helpers.show(indicator);
    },

    updateConditionalFields() {
        const isInv = this.data.purpose === 'investment-apartment' || this.data.purpose === 'investment-land';
        Helpers.toggle(Helpers.$('#investmentFields'), isInv);
    },

    validateCurrentStep() {
        const stepId = this.stepMap[this.wizardMode]?.[this.currentStep];
        const step = Helpers.$(`#${stepId}`);
        if (!step) return true;
        Validation.clearAllErrors(step);
        let valid = true;

        if (this.currentStep === 1) {
            if (!this.data.purpose) {
                const group = step.querySelector('.purpose-group');
                if (group) {
                    group.appendChild(Helpers.create('div', { className: 'field-error', textContent: 'Zvoľte účel hypotéky' }));
                }
                valid = false;
            }
        }

        if (stepId === 'step-property') {
            const pv = Helpers.$('#propertyValue');
            const of = Helpers.$('#ownFunds');
            if (!Validation.isPositiveNumber(pv.value)) {
                Validation.showError(pv, 'Zadajte hodnotu nehnuteľnosti'); valid = false;
            }
            if (!Validation.isNonNegativeNumber(of.value)) {
                Validation.showError(of, 'Zadajte vlastné zdroje'); valid = false;
            }
            if (valid && Helpers.parseNumber(of.value) >= Helpers.parseNumber(pv.value)) {
                Validation.showError(of, 'Vlastné zdroje musia byť nižšie ako hodnota nehnuteľnosti'); valid = false;
            }
        }

        if (stepId === 'step-finances') {
            const income = Helpers.$('#monthlyIncome');
            const age = Helpers.$('#applicantAge');
            const term = Helpers.$('#loanTerm');
            if (!Validation.isPositiveNumber(income.value)) {
                Validation.showError(income, 'Zadajte mesačný príjem'); valid = false;
            }
            if (!Validation.isInRange(age.value, 18, 70)) {
                Validation.showError(age, 'Vek musí byť medzi 18 a 70'); valid = false;
            }
            if (!Validation.isInRange(term.value, 4, 30)) {
                Validation.showError(term, 'Splatnosť 4–30 rokov'); valid = false;
            }
        }

        return valid;
    },

    validateMaxStep() {
        const pv = Helpers.$('#propertyValueMax');
        const of = Helpers.$('#ownFundsMax');
        Validation.clearError(pv);
        Validation.clearError(of);
        let valid = true;
        if (!Validation.isPositiveNumber(pv.value)) {
            Validation.showError(pv, 'Zadajte hodnotu nehnuteľnosti'); valid = false;
        }
        if (!Validation.isNonNegativeNumber(of.value)) {
            Validation.showError(of, 'Zadajte vlastné zdroje'); valid = false;
        }
        if (valid && Helpers.parseNumber(of.value) >= Helpers.parseNumber(pv.value)) {
            Validation.showError(of, 'Vlastné zdroje musia byť nižšie ako hodnota nehnuteľnosti'); valid = false;
        }
        return valid;
    },

    collectStepData() {
        const stepId = this.stepMap[this.wizardMode]?.[this.currentStep];

        if (stepId === 'step-property') {
            this.data.propertyValue = Helpers.parseNumber(Helpers.$('#propertyValue')?.value);
            this.data.ownFunds = Helpers.parseNumber(Helpers.$('#ownFunds')?.value);
        }

        if (stepId === 'step-finances') {
            this.data.monthlyIncome = Helpers.parseNumber(Helpers.$('#monthlyIncome')?.value);
            this.data.age = Helpers.parseNumber(Helpers.$('#applicantAge')?.value);
            this.data.loanTermYears = Helpers.parseNumber(Helpers.$('#loanTerm')?.value);
            this.data.children = Helpers.parseNumber(Helpers.$('#children')?.value) || 0;

            const hasCo = Helpers.$('#hasCoApplicant')?.checked;
            this.data.adults = hasCo ? 2 : 1;
            if (hasCo) {
                this.data.monthlyIncome += Helpers.parseNumber(Helpers.$('#coApplicantIncome')?.value);
            }

            this.data.existingPayments = Calculator.existingObligations(
                Helpers.parseNumber(Helpers.$('#creditCardLimit')?.value),
                Helpers.parseNumber(Helpers.$('#overdraftLimit')?.value),
                Helpers.parseNumber(Helpers.$('#existingLoanPayments')?.value)
            );
            this.data.existingDebtBalance = Calculator.existingDebtBalance(
                Helpers.parseNumber(Helpers.$('#creditCardLimit')?.value),
                Helpers.parseNumber(Helpers.$('#overdraftLimit')?.value),
                Helpers.parseNumber(Helpers.$('#existingLoanBalance')?.value)
            );

            if (this.data.purpose === 'investment-apartment' || this.data.purpose === 'investment-land') {
                this.data.monthlyRent = Helpers.parseNumber(Helpers.$('#monthlyRent')?.value);
                this.data.monthlyEnergies = Helpers.parseNumber(Helpers.$('#monthlyEnergies')?.value) || 100;
            }
        }
    },

    calculateMax() {
        // Vypočítaj max hypotéku len na základe DTI/DSTI (bez konkrétnej nehnuteľnosti)
        const params = {
            propertyValue: 9999999,
            ownFunds: 0,
            monthlyIncome: this.data.monthlyIncome,
            age: this.data.age,
            loanTermYears: this.data.loanTermYears,
            fixation: this.data.fixation || 5,
            adults: this.data.adults || 1,
            children: this.data.children || 0,
            existingPayments: this.data.existingPayments || 0,
            existingDebtBalance: this.data.existingDebtBalance || 0,
            propertyType: this.data.propertyType || 'apartment',
            purpose: this.data.purpose
        };

        const results = Calculator.calculateAll(params);
        const container = Helpers.$('#max-results-table');
        if (!container) return;

        let html = '<table class="comparison-table"><thead><tr>';
        html += '<th>Banka</th><th>Max. hypotéka</th><th>Mesačná splátka</th><th>Sadzba</th><th>Obmedzuje</th>';
        html += '</tr></thead><tbody>';

        results.forEach((r, i) => {
            const hl = i === 0 ? ' style="background:rgba(26,86,219,0.04)"' : '';
            const payment = Calculator.annuityPayment(r.maxMortgage, r.effectiveRate, params.loanTermYears * 12);
            html += `<tr${hl}>`;
            html += `<td style="color:${r.bank.color};font-weight:600">${r.bank.shortName}</td>`;
            html += `<td><strong>${Formatting.eurShort(r.maxMortgage)}</strong></td>`;
            html += `<td>${Formatting.eur(payment)}</td>`;
            html += `<td>${Formatting.percent(r.effectiveRate)}</td>`;
            html += `<td><span class="badge-neutral">${r.limitingFactor}</span></td>`;
            html += '</tr>';
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    },

    calculate() {
        const params = {
            propertyValue: this.data.propertyValue,
            ownFunds: this.data.ownFunds,
            monthlyIncome: this.data.monthlyIncome,
            age: this.data.age,
            loanTermYears: this.data.loanTermYears,
            fixation: this.data.fixation || 5,
            adults: this.data.adults || 1,
            children: this.data.children || 0,
            existingPayments: this.data.existingPayments || 0,
            existingDebtBalance: this.data.existingDebtBalance || 0,
            propertyType: this.data.propertyType || 'apartment',
            purpose: this.data.purpose
        };

        const results = Calculator.calculateAll(params);
        Comparison.currentResults = results;

        this.renderResults(results, params);
        Comparison.render(results);

        const tableWrapper = Helpers.$('#comparison-table-wrapper');
        if (tableWrapper) tableWrapper.innerHTML = Comparison.renderSummaryTable(results);

        if (results.length > 0 && results[0].approved) {
            const best = results[0];
            const schedule = Amortization.generate(best.actualLoan, best.effectiveRate, params.loanTermYears * 12);

            Charts.principalVsInterest('chart-pie', best.actualLoan, best.totalInterest);
            Charts.amortizationChart('chart-amortization', schedule);
            Charts.bankComparison('chart-comparison', results.filter(r => r.approved));

            const amortContainer = Helpers.$('#amortization-table');
            if (amortContainer) amortContainer.innerHTML = Amortization.renderTable(schedule, 'yearly');

            const rpmn = Amortization.calculateRPMN(
                best.actualLoan, best.monthlyPayment, params.loanTermYears * 12,
                best.bank.fees.propertyValuation
            );
            const rpmnEl = Helpers.$('#rpmn-value');
            if (rpmnEl) rpmnEl.textContent = Formatting.percent(rpmn);
        }

        if ((params.purpose === 'investment-apartment' || params.purpose === 'investment-land') && this.data.monthlyRent > 0) {
            const bestApproved = results.find(r => r.approved);
            if (bestApproved) {
                const analysis = Investment.analyze({
                    propertyValue: params.propertyValue,
                    ownFunds: params.ownFunds,
                    monthlyRent: this.data.monthlyRent,
                    monthlyMortgage: bestApproved.monthlyPayment,
                    monthlyEnergies: this.data.monthlyEnergies || 100,
                    annualRate: bestApproved.effectiveRate,
                    loanTermYears: params.loanTermYears,
                    holdingYears: 10
                });
                Investment.render(analysis);
                Charts.investmentScenarios('chart-investment', analysis);
                Helpers.show(Helpers.$('#investment-section'));
            }
        } else {
            Helpers.hide(Helpers.$('#investment-section'));
        }

        const youngCheck = Calculator.youngMortgageEligibility(
            params.age, params.monthlyIncome, params.propertyValue
        );
        this.renderYoungMortgage(youngCheck);

        Helpers.show(Helpers.$('#results-section'));
        Helpers.scrollTo(Helpers.$('#step-4'));
    },

    renderResults(results, params) {
        const container = Helpers.$('#results-summary');
        if (!container) return;

        const requestedLoan = params.propertyValue - params.ownFunds;
        const best = results.find(r => r.approved);

        let html = `<div class="results-header"><h2>Výsledky analýzy</h2><div class="results-overview">
            <div class="result-card">
                <span class="result-label">Požadovaný úver</span>
                <span class="result-value">${Formatting.eurShort(requestedLoan)}</span>
            </div>`;

        if (best) {
            html += `
            <div class="result-card highlight">
                <span class="result-label">Najlepšia mesačná splátka</span>
                <span class="result-value">${Formatting.eur(best.monthlyPayment)}</span>
                <span class="result-note">${best.bank.name} @ ${Formatting.percent(best.effectiveRate)}</span>
            </div>
            <div class="result-card">
                <span class="result-label">Max. hypotéka (najlepšia)</span>
                <span class="result-value">${Formatting.eurShort(best.maxMortgage)}</span>
                <span class="result-note">Obmedzuje: ${best.limitingFactor}</span>
            </div>`;
        } else {
            html += `<div class="result-card warning">
                <span class="result-label">Žiadna banka neschváli</span>
                <span class="result-value">Upravte parametre</span>
            </div>`;
        }

        html += `<div class="result-card">
            <span class="result-label">RPMN</span>
            <span class="result-value" id="rpmn-value">–</span>
        </div></div></div>`;
        container.innerHTML = html;
    },

    renderYoungMortgage(check) {
        const container = Helpers.$('#young-mortgage');
        if (!container) return;
        if (check.eligible) {
            container.innerHTML = `
            <div class="info-box info-success">
                <h4>Hypotéka pre mladých – daňový bonus</h4>
                <p>Spĺňate podmienky! Môžete získať daňový bonus <strong>50 % zaplatených úrokov</strong>, max <strong>${Formatting.eur(check.maxBonusPerYear, 0)}/rok</strong> počas <strong>${check.bonusDuration} rokov</strong>.</p>
                <p>Celková úspora až <strong>${Formatting.eur(check.maxBonusTotal, 0)}</strong>.</p>
            </div>`;
        } else {
            container.innerHTML = `
            <div class="info-box info-neutral">
                <h4>Hypotéka pre mladých</h4>
                <p>Nespĺňate podmienky:</p>
                <ul>${check.reasons.map(r => `<li>${r}</li>`).join('')}</ul>
            </div>`;
        }
    }
};
