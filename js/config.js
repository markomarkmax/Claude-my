/**
 * NBS regulatory parameters and application constants
 */
const CONFIG = {
    // NBS DTI limits
    DTI: {
        standard: 8,        // max 8x annual net income
        youngLimit: 9,       // up to 9x for under 35 (bank exception)
        youngAge: 35,
        reductionAge: 41,    // DTI reduces by 0.25 per year if maturity > 65
        reductionPerYear: 0.25,
        maxAge: 65           // max age at loan maturity
    },

    // NBS DSTI limits
    DSTI: {
        maxRatio: 0.60,      // max 60% of (income - living minimum)
        stressTestAdd: 2.0,  // +2% stress test
        stressTestMin: 5.0   // minimum stress test rate
    },

    // LTV limits
    LTV: {
        standard: 80,
        max: 90,
        land: 60,
        landWithPermit: 80,
        purposeFree: 70
    },

    // Living minimum (valid 1.7.2025 - 30.6.2026)
    LIVING_MINIMUM: {
        adult: 284.13,
        additionalAdult: 198.22,
        child: 129.74,
        validFrom: '2025-07-01',
        validTo: '2026-06-30'
    },

    // Existing obligations calculation
    OBLIGATIONS: {
        creditCardRate: 0.05,    // 5% of limit as monthly payment
        overdraftRate: 0.05      // 5% of limit as monthly payment
    },

    // Mortgage for young people (tax bonus)
    YOUNG_MORTGAGE: {
        maxAge: 35,
        maxIncomeFactor: 1.6,     // max 1.6x average wage
        averageWage: 1430,        // approximate average wage 2025/2026
        bonusRate: 0.50,          // 50% of paid interest
        maxBonusPerYear: 400,     // max 400 EUR/year
        bonusDuration: 5,         // 5 years
        maxPropertyValue: 200000  // max 200 000 EUR
    },

    // Default values
    DEFAULTS: {
        propertyValue: 150000,
        ownFunds: 30000,
        monthlyIncome: 1500,
        loanTermYears: 30,
        fixationPeriod: 5,
        interestRate: 3.89
    },

    // UI
    UI: {
        maxLoanTermYears: 30,
        minLoanTermYears: 4,
        animationDuration: 300,
        debounceDelay: 300
    },

    // Investment module defaults
    INVESTMENT: {
        rentalYield: 4.5,           // % annual
        propertyAppreciation: {
            optimistic: 5.0,
            realistic: 2.5,
            pessimistic: 0.0
        },
        alternatives: {
            etf: 8.0,
            bonds: 3.5,
            deposit: 2.5
        },
        taxRate: 19,                // income tax %
        flatExpenseRate: 60,        // 60% flat-rate expenses
        depreciationYears: 40,      // building depreciation period
        managementCostRate: 10,     // % of rental income
        vacancyRate: 5,             // % vacancy assumption
        maintenanceRate: 1          // % of property value per year
    }
};
