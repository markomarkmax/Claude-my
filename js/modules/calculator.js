/**
 * Core mortgage calculator - DTI, DSTI, LTV, stress test, annuity
 */
const Calculator = {
    /**
     * Calculate monthly annuity payment
     * M = P * [r(1+r)^n] / [(1+r)^n - 1]
     */
    annuityPayment(principal, annualRate, months) {
        if (principal <= 0 || months <= 0) return 0;
        if (annualRate <= 0) return principal / months;

        const r = annualRate / 100 / 12;
        const factor = Math.pow(1 + r, months);
        return principal * (r * factor) / (factor - 1);
    },

    /**
     * Calculate max principal from monthly payment (inverse annuity)
     * P = M * [(1+r)^n - 1] / [r(1+r)^n]
     */
    maxPrincipalFromPayment(maxPayment, annualRate, months) {
        if (maxPayment <= 0 || months <= 0) return 0;
        if (annualRate <= 0) return maxPayment * months;

        const r = annualRate / 100 / 12;
        const factor = Math.pow(1 + r, months);
        return maxPayment * (factor - 1) / (r * factor);
    },

    /**
     * Calculate living minimum for household
     */
    livingMinimum(adults, children) {
        const lm = CONFIG.LIVING_MINIMUM;
        let total = lm.adult; // primary applicant
        if (adults > 1) {
            total += (adults - 1) * lm.additionalAdult;
        }
        total += children * lm.child;
        return total;
    },

    /**
     * Calculate max DTI (total debt limit)
     */
    maxDTI(monthlyIncome, age, loanTermYears, existingDebtBalance = 0) {
        let dtiMultiplier = CONFIG.DTI.standard; // 8x

        // Young exception (under 35)
        if (age < CONFIG.DTI.youngAge) {
            dtiMultiplier = CONFIG.DTI.youngLimit; // 9x
        }

        // Reduction for older applicants if loan extends past 65
        const ageAtMaturity = age + loanTermYears;
        if (age >= CONFIG.DTI.reductionAge && ageAtMaturity > CONFIG.DTI.maxAge) {
            const yearsOver = ageAtMaturity - CONFIG.DTI.maxAge;
            dtiMultiplier -= yearsOver * CONFIG.DTI.reductionPerYear;
            dtiMultiplier = Math.max(dtiMultiplier, 0);
        }

        const maxTotalDebt = monthlyIncome * 12 * dtiMultiplier;
        const maxMortgage = maxTotalDebt - existingDebtBalance;
        return {
            multiplier: dtiMultiplier,
            maxTotalDebt,
            maxMortgage: Math.max(0, maxMortgage),
            limitingFactor: 'DTI'
        };
    },

    /**
     * Calculate max DSTI (monthly payment limit)
     * Using stress test rate
     */
    maxDSTI(monthlyIncome, adults, children, existingPayments, bankRate, loanTermMonths) {
        const lm = this.livingMinimum(adults, children);

        // Max payment = (income - living minimum) * 60% - existing payments
        const maxPayment = (monthlyIncome - lm) * CONFIG.DSTI.maxRatio - existingPayments;

        if (maxPayment <= 0) {
            return {
                maxPayment: 0,
                maxMortgage: 0,
                stressRate: 0,
                livingMinimum: lm,
                disposableIncome: monthlyIncome - lm,
                limitingFactor: 'DSTI'
            };
        }

        // Stress test rate
        const stressRate = Math.max(bankRate + CONFIG.DSTI.stressTestAdd, CONFIG.DSTI.stressTestMin);

        // Max principal from stress-tested payment
        const maxMortgage = this.maxPrincipalFromPayment(maxPayment, stressRate, loanTermMonths);

        return {
            maxPayment,
            maxMortgage: Math.max(0, maxMortgage),
            stressRate,
            livingMinimum: lm,
            disposableIncome: monthlyIncome - lm,
            limitingFactor: 'DSTI'
        };
    },

    /**
     * Calculate max LTV
     */
    maxLTV(propertyValue, ownFunds, bank, propertyType = 'apartment') {
        let ltvLimit = bank.ltv.standard;
        let surcharge = 0;

        if (propertyType === 'land') {
            ltvLimit = bank.ltv.land;
        } else if (propertyType === 'landWithPermit') {
            ltvLimit = bank.ltv.landWithPermit;
        } else if (propertyType === 'purposeFree') {
            ltvLimit = bank.ltv.purposeFree;
        }

        const maxLoanLTV = propertyValue * (ltvLimit / 100);
        const requestedLoan = propertyValue - ownFunds;
        const actualLTV = (requestedLoan / propertyValue) * 100;

        // Check if LTV surcharge applies
        if (actualLTV > bank.ltv.standard && actualLTV <= bank.ltv.max) {
            surcharge = bank.ltv.surchargeAbove80;
            ltvLimit = bank.ltv.max;
        }

        return {
            maxLoanLTV,
            actualLTV: Math.min(actualLTV, 100),
            ltvLimit,
            surcharge,
            limitingFactor: 'LTV'
        };
    },

    /**
     * Calculate existing obligations monthly impact
     */
    existingObligations(creditCardLimit = 0, overdraftLimit = 0, loanPayments = 0) {
        const ccPayment = creditCardLimit * CONFIG.OBLIGATIONS.creditCardRate;
        const odPayment = overdraftLimit * CONFIG.OBLIGATIONS.overdraftRate;
        return ccPayment + odPayment + loanPayments;
    },

    /**
     * Calculate total existing debt balance (for DTI)
     */
    existingDebtBalance(creditCardLimit = 0, overdraftLimit = 0, loanBalances = 0) {
        return creditCardLimit + overdraftLimit + loanBalances;
    },

    /**
     * Full calculation for a single bank
     */
    calculateForBank(params, bank) {
        const {
            propertyValue,
            ownFunds,
            monthlyIncome,
            age,
            loanTermYears,
            fixation,
            adults,
            children,
            existingPayments,
            existingDebtBalance,
            propertyType,
            purpose
        } = params;

        const loanTermMonths = loanTermYears * 12;

        // Get bank rate
        const baseRate = getBankRate(bank.id, fixation);
        if (baseRate == null) {
            return null; // Bank doesn't offer this fixation
        }

        // LTV calculation
        const ltv = this.maxLTV(propertyValue, ownFunds, bank, propertyType);
        const effectiveRate = baseRate + ltv.surcharge;

        // DTI
        const dti = this.maxDTI(monthlyIncome, age, loanTermYears, existingDebtBalance);

        // DSTI
        const dsti = this.maxDSTI(
            monthlyIncome, adults, children,
            existingPayments, effectiveRate, loanTermMonths
        );

        // Requested loan
        const requestedLoan = propertyValue - ownFunds;

        // Max mortgage = min(DTI, DSTI, LTV)
        const maxMortgage = Math.min(dti.maxMortgage, dsti.maxMortgage, ltv.maxLoanLTV);

        // Determine limiting factor
        let limitingFactor = 'DTI';
        if (maxMortgage === dsti.maxMortgage) limitingFactor = 'DSTI';
        if (maxMortgage === ltv.maxLoanLTV) limitingFactor = 'LTV';

        // Actual loan (capped by max and requested)
        const actualLoan = Math.min(requestedLoan, maxMortgage);
        const approved = actualLoan >= requestedLoan && requestedLoan > 0;

        // Calculate monthly payment for actual loan
        const monthlyPayment = this.annuityPayment(actualLoan, effectiveRate, loanTermMonths);
        const totalPayment = monthlyPayment * loanTermMonths;
        const totalInterest = totalPayment - actualLoan;

        // Check age limit
        const ageAtMaturity = age + loanTermYears;
        const ageOk = ageAtMaturity <= bank.loanTerms.maxAgeAtMaturity;

        // Check min loan
        const meetsMinLoan = actualLoan >= bank.minLoan;

        // Check loan term
        const termOk = loanTermYears >= bank.loanTerms.minYears &&
                        loanTermYears <= bank.loanTerms.maxYears;

        return {
            bank: bank,
            baseRate,
            effectiveRate,
            ltvSurcharge: ltv.surcharge,
            actualLTV: ltv.actualLTV,
            requestedLoan,
            maxMortgage,
            actualLoan,
            approved: approved && ageOk && meetsMinLoan && termOk,
            monthlyPayment,
            totalPayment,
            totalInterest,
            limitingFactor,
            dti,
            dsti,
            ltv,
            ageAtMaturity,
            ageOk,
            meetsMinLoan,
            termOk,
            warnings: this.getWarnings(ltv, dti, dsti, ageAtMaturity, bank, actualLoan)
        };
    },

    /**
     * Calculate for all banks and rank
     */
    calculateAll(params) {
        const results = [];

        for (const bank of BANKS) {
            const result = this.calculateForBank(params, bank);
            if (result) {
                results.push(result);
            }
        }

        // Sort: approved first, then by monthly payment (ascending)
        results.sort((a, b) => {
            if (a.approved !== b.approved) return a.approved ? -1 : 1;
            return a.monthlyPayment - b.monthlyPayment;
        });

        return results;
    },

    /**
     * Generate warnings for a result
     */
    getWarnings(ltv, dti, dsti, ageAtMaturity, bank, loan) {
        const warnings = [];

        if (ltv.actualLTV > 80) {
            warnings.push('LTV presahuje 80% – banka účtuje prirážku k úrok. sadzbe');
        }
        if (ltv.actualLTV > 90) {
            warnings.push('LTV presahuje 90% – väčšina bánk neschváli');
        }
        if (ageAtMaturity > 60) {
            warnings.push(`Vek pri splatnosti ${ageAtMaturity} rokov – blíži sa k limitu ${bank.loanTerms.maxAgeAtMaturity}`);
        }
        if (ageAtMaturity > bank.loanTerms.maxAgeAtMaturity) {
            warnings.push(`Vek pri splatnosti ${ageAtMaturity} prekračuje limit ${bank.loanTerms.maxAgeAtMaturity} rokov`);
        }
        if (dsti.maxPayment < 100) {
            warnings.push('Veľmi nízky priestor pre splátku po odpočítaní životného minima');
        }
        if (loan < bank.minLoan) {
            warnings.push(`Minimálna výška úveru je ${Formatting.eur(bank.minLoan, 0)}`);
        }

        return warnings;
    },

    /**
     * Check eligibility for mortgage for young people (tax bonus)
     */
    youngMortgageEligibility(age, monthlyIncome, propertyValue) {
        const cfg = CONFIG.YOUNG_MORTGAGE;
        const eligible = age <= cfg.maxAge &&
                         monthlyIncome <= cfg.averageWage * cfg.maxIncomeFactor &&
                         propertyValue <= cfg.maxPropertyValue;

        const maxBonusTotal = cfg.maxBonusPerYear * cfg.bonusDuration;

        return {
            eligible,
            maxBonusPerYear: cfg.maxBonusPerYear,
            maxBonusTotal,
            bonusDuration: cfg.bonusDuration,
            reasons: !eligible ? [
                age > cfg.maxAge ? `Vek (${age}) presahuje limit ${cfg.maxAge} rokov` : null,
                monthlyIncome > cfg.averageWage * cfg.maxIncomeFactor ? 'Príjem presahuje 1,6-násobok priemernej mzdy' : null,
                propertyValue > cfg.maxPropertyValue ? `Hodnota nehnuteľnosti presahuje ${Formatting.eur(cfg.maxPropertyValue, 0)}` : null
            ].filter(Boolean) : []
        };
    }
};
