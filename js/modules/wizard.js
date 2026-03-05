/**
 * 4-step wizard: Purpose, Property, Finances, Results
 */
const Wizard = {
    currentStep: 1,
    totalSteps: 4,
    data: {},

    init() {
        this.data.fixation = 5; // default
        this.data.propertyType = 'apartment'; // default
        this.bindStepNavigation();
        this.bindInputs();
        this.showStep(1);
    },

    bindStepNavigation() {
        // Next buttons
        Helpers.$$('.wizard-next').forEach(btn => {
            btn.addEventListener('click', () => this.nextStep());
        });
        // Back buttons
        Helpers.$$('.wizard-back').forEach(btn => {
            btn.addEventListener('click', () => this.prevStep());
        });
        // Step indicators
        Helpers.$$('.step-indicator').forEach(ind => {
            ind.addEventListener('click', () => {
                const step = parseInt(ind.dataset.step);
                if (step < this.currentStep) this.goToStep(step);
            });
        });
    },

    bindInputs() {
        // Purpose selection
        Helpers.$$('input[name="purpose"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.data.purpose = radio.value;
                this.updateConditionalFields();
            });
        });

        // Property type
        Helpers.$$('input[name="propertyType"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.data.propertyType = radio.value;
                this.updateConditionalFields();
            });
        });

        // Income type
        Helpers.$$('input[name="incomeType"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.data.incomeType = radio.value;
            });
        });

        // Real-time LTV indicator
        const propValue = Helpers.$('#propertyValue');
        const ownFunds = Helpers.$('#ownFunds');
        if (propValue && ownFunds) {
            const updateLTV = Helpers.debounce(() => this.updateLTVIndicator(), 200);
            propValue.addEventListener('input', updateLTV);
            ownFunds.addEventListener('input', updateLTV);
        }

        // Fixation period buttons
        Helpers.$$('.fix-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                Helpers.$$('.fix-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.data.fixation = parseInt(btn.dataset.fix);
            });
        });

        // Co-applicant toggle
        const coApplicant = Helpers.$('#hasCoApplicant');
        if (coApplicant) {
            coApplicant.addEventListener('change', () => {
                Helpers.toggle(Helpers.$('#coApplicantFields'), coApplicant.checked);
            });
        }
    },

    updateLTVIndicator() {
        const value = Helpers.parseNumber(Helpers.$('#propertyValue')?.value);
        const funds = Helpers.parseNumber(Helpers.$('#ownFunds')?.value);
        const indicator = Helpers.$('#ltv-indicator');

        if (!indicator || value <= 0) return;

        const loan = value - funds;
        const ltv = (loan / value) * 100;
        const ltvClamped = Math.min(Math.max(ltv, 0), 100);

        indicator.querySelector('.ltv-value').textContent = Formatting.percent(ltvClamped, 1);

        const bar = indicator.querySelector('.ltv-bar-fill');
        bar.style.width = ltvClamped + '%';

        // Color coding
        bar.className = 'ltv-bar-fill';
        if (ltvClamped <= 70) bar.classList.add('ltv-green');
        else if (ltvClamped <= 80) bar.classList.add('ltv-yellow');
        else if (ltvClamped <= 90) bar.classList.add('ltv-orange');
        else bar.classList.add('ltv-red');

        // Info text
        const info = indicator.querySelector('.ltv-info');
        if (ltvClamped <= 80) {
            info.textContent = 'Standardne LTV - bez prirazky';
        } else if (ltvClamped <= 90) {
            info.textContent = 'LTV nad 80% - banka uctuva prirazku k sadzbe';
        } else {
            info.textContent = 'LTV nad 90% - vacsina bank neschvali';
        }

        Helpers.show(indicator);
    },

    updateConditionalFields() {
        // Show investment fields if purpose is investment
        const investmentFields = Helpers.$('#investmentFields');
        if (investmentFields) {
            Helpers.toggle(investmentFields, this.data.purpose === 'investment-apartment' || this.data.purpose === 'investment-land');
        }

        // Update property type options based on purpose
        const landOption = Helpers.$('#propertyType-land');
        if (landOption) {
            const parent = landOption.closest('.radio-option');
            if (parent) {
                Helpers.toggle(parent, this.data.purpose === 'investment-land' || this.data.purpose === 'housing');
            }
        }
    },

    showStep(step) {
        Helpers.$$('.wizard-step').forEach(s => {
            s.classList.remove('active');
            if (parseInt(s.dataset.step) === step) {
                s.classList.add('active');
            }
        });

        // Update step indicators
        Helpers.$$('.step-indicator').forEach(ind => {
            const s = parseInt(ind.dataset.step);
            ind.classList.remove('active', 'completed');
            if (s === step) ind.classList.add('active');
            else if (s < step) ind.classList.add('completed');
        });

        this.currentStep = step;

        // If step 4, trigger calculation
        if (step === 4) {
            this.calculate();
        }
    },

    goToStep(step) {
        if (step >= 1 && step <= this.totalSteps) {
            this.showStep(step);
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

    validateCurrentStep() {
        const step = Helpers.$(`.wizard-step[data-step="${this.currentStep}"]`);
        if (!step) return true;

        Validation.clearAllErrors(step);
        let valid = true;

        if (this.currentStep === 1) {
            if (!this.data.purpose) {
                const group = step.querySelector('.purpose-group');
                if (group) {
                    const msg = Helpers.create('div', { className: 'field-error', textContent: 'Zvolte ucel hypoteky' });
                    group.appendChild(msg);
                }
                valid = false;
            }
        }

        if (this.currentStep === 2) {
            const propVal = Helpers.$('#propertyValue');
            const ownFnds = Helpers.$('#ownFunds');

            if (!Validation.isPositiveNumber(propVal.value)) {
                Validation.showError(propVal, 'Zadajte hodnotu nehnutelnosti');
                valid = false;
            }
            if (!Validation.isNonNegativeNumber(ownFnds.value)) {
                Validation.showError(ownFnds, 'Zadajte vlastne zdroje');
                valid = false;
            }
            if (valid && Helpers.parseNumber(ownFnds.value) >= Helpers.parseNumber(propVal.value)) {
                Validation.showError(ownFnds, 'Vlastne zdroje musia byt menej ako hodnota nehnutelnosti');
                valid = false;
            }
        }

        if (this.currentStep === 3) {
            const income = Helpers.$('#monthlyIncome');
            const age = Helpers.$('#applicantAge');
            const term = Helpers.$('#loanTerm');

            if (!Validation.isPositiveNumber(income.value)) {
                Validation.showError(income, 'Zadajte mesacny prijem');
                valid = false;
            }
            if (!Validation.isInRange(age.value, 18, 70)) {
                Validation.showError(age, 'Vek musi byt medzi 18 a 70');
                valid = false;
            }
            if (!Validation.isInRange(term.value, 4, 30)) {
                Validation.showError(term, 'Splatnost 4-30 rokov');
                valid = false;
            }
            if (!this.data.fixation) {
                this.data.fixation = 5; // default
            }
        }

        return valid;
    },

    collectStepData() {
        if (this.currentStep === 2) {
            this.data.propertyValue = Helpers.parseNumber(Helpers.$('#propertyValue')?.value);
            this.data.ownFunds = Helpers.parseNumber(Helpers.$('#ownFunds')?.value);
        }

        if (this.currentStep === 3) {
            this.data.monthlyIncome = Helpers.parseNumber(Helpers.$('#monthlyIncome')?.value);
            this.data.age = Helpers.parseNumber(Helpers.$('#applicantAge')?.value);
            this.data.loanTermYears = Helpers.parseNumber(Helpers.$('#loanTerm')?.value);
            this.data.children = Helpers.parseNumber(Helpers.$('#children')?.value) || 0;

            // Co-applicant
            const hasCo = Helpers.$('#hasCoApplicant')?.checked;
            this.data.adults = hasCo ? 2 : 1;
            if (hasCo) {
                this.data.monthlyIncome += Helpers.parseNumber(Helpers.$('#coApplicantIncome')?.value);
            }

            // Existing obligations
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

            // Investment fields
            if (this.data.purpose === 'investment-apartment' || this.data.purpose === 'investment-land') {
                this.data.monthlyRent = Helpers.parseNumber(Helpers.$('#monthlyRent')?.value);
                this.data.monthlyEnergies = Helpers.parseNumber(Helpers.$('#monthlyEnergies')?.value) || 100;
            }
        }
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

        // Calculate for all banks
        const results = Calculator.calculateAll(params);
        Comparison.currentResults = results;

        // Render results
        this.renderResults(results, params);

        // Render comparison
        Comparison.render(results, Mode.current);

        // Advisor: summary table
        const tableWrapper = Helpers.$('#comparison-table-wrapper');
        if (tableWrapper) {
            tableWrapper.innerHTML = Comparison.renderSummaryTable(results);
        }

        // Render charts
        if (results.length > 0 && results[0].approved) {
            const best = results[0];
            const schedule = Amortization.generate(
                best.actualLoan, best.effectiveRate, params.loanTermYears * 12
            );

            Charts.principalVsInterest('chart-pie', best.actualLoan, best.totalInterest);
            Charts.amortizationChart('chart-amortization', schedule);
            Charts.bankComparison('chart-comparison', results.filter(r => r.approved));

            // Amortization table
            const amortContainer = Helpers.$('#amortization-table');
            if (amortContainer) {
                amortContainer.innerHTML = Amortization.renderTable(schedule, 'yearly');
            }

            // RPMN
            const rpmn = Amortization.calculateRPMN(
                best.actualLoan, best.monthlyPayment, params.loanTermYears * 12,
                best.bank.fees.propertyValuation
            );
            const rpmnEl = Helpers.$('#rpmn-value');
            if (rpmnEl) rpmnEl.textContent = Formatting.percent(rpmn);
        }

        // Investment analysis
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

        // Young mortgage check
        const youngCheck = Calculator.youngMortgageEligibility(
            params.age, params.monthlyIncome, params.propertyValue
        );
        this.renderYoungMortgage(youngCheck);

        // Show results section
        Helpers.show(Helpers.$('#results-section'));
        Helpers.scrollTo(Helpers.$('#results-section'));
    },

    renderResults(results, params) {
        const container = Helpers.$('#results-summary');
        if (!container) return;

        const requestedLoan = params.propertyValue - params.ownFunds;
        const best = results.find(r => r.approved);

        let html = `
        <div class="results-header">
            <h2>Vysledky analyzy</h2>
            <div class="results-overview">
                <div class="result-card">
                    <span class="result-label">Pozadovany uver</span>
                    <span class="result-value">${Formatting.eurShort(requestedLoan)}</span>
                </div>`;

        if (best) {
            html += `
                <div class="result-card highlight">
                    <span class="result-label">Najlepsia mesacna splatka</span>
                    <span class="result-value">${Formatting.eur(best.monthlyPayment)}</span>
                    <span class="result-note">${best.bank.name} @ ${Formatting.percent(best.effectiveRate)}</span>
                </div>
                <div class="result-card">
                    <span class="result-label">Max. hypoteka (najlepsia)</span>
                    <span class="result-value">${Formatting.eurShort(best.maxMortgage)}</span>
                    <span class="result-note">Limitovane: ${best.limitingFactor}</span>
                </div>`;
        } else {
            html += `
                <div class="result-card warning">
                    <span class="result-label">Ziadna banka neschvali</span>
                    <span class="result-value">Upravte parametre</span>
                </div>`;
        }

        html += `
                <div class="result-card">
                    <span class="result-label">RPMN</span>
                    <span class="result-value" id="rpmn-value">-</span>
                </div>
            </div>
        </div>`;

        container.innerHTML = html;
    },

    renderYoungMortgage(check) {
        const container = Helpers.$('#young-mortgage');
        if (!container) return;

        if (check.eligible) {
            container.innerHTML = `
            <div class="info-box info-success">
                <h4>Hypoteka pre mladych - danovy bonus</h4>
                <p>Splnate podmienky! Mozete ziskat danovy bonus <strong>50% zaplatených urokov</strong>, max <strong>${Formatting.eur(check.maxBonusPerYear, 0)}/rok</strong> pocas <strong>${check.bonusDuration} rokov</strong>.</p>
                <p>Celkova uspora az <strong>${Formatting.eur(check.maxBonusTotal, 0)}</strong>.</p>
            </div>`;
        } else {
            container.innerHTML = `
            <div class="info-box info-neutral">
                <h4>Hypoteka pre mladych</h4>
                <p>Nesplnate podmienky:</p>
                <ul>${check.reasons.map(r => `<li>${r}</li>`).join('')}</ul>
            </div>`;
        }
    }
};
