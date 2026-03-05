/**
 * Complete bank data for 8 Slovak banks
 * Source: Prosight materials, March 2026
 * Update: Manually edit this file when rates change
 */
const BANKS = [
    {
        id: 'slsp',
        name: 'Slovenska sporitelna',
        shortName: 'SLSP',
        color: '#0066b3',
        rates: {
            fix1: 3.89,
            fix3: 3.69,  // base without discounts
            fix5: 3.89,
            fix10: 4.69,
            fix15: null,
            fix20: null
        },
        campaignRates: {
            fix3: 3.19,  // with account (-0.5%) and insurance (-0.2%) discounts at max 80% LTV
        },
        campaignNote: 'FIX 3: 3,19% so zlavami za ucet (-0,5%) a uverove poistenie (-0,2%) pri max 80% LTV',
        campaignValidUntil: '2026-04-30',
        discounts: [
            { name: 'Ucet v SLSP', value: -0.50 },
            { name: 'Uverove poistenie', value: -0.20 }
        ],
        fees: {
            processing: 0,           // EUR, often waived in campaigns
            monthlyAccount: 0,
            earlyRepayment: 0,       // within refixation window
            earlyRepaymentPenalty: 1, // % of remaining, outside window
            propertyValuation: 150,
            extraPaymentFree: 20,    // % per year
        },
        ltv: {
            standard: 80,
            max: 90,
            surchargeAbove80: 0.30,   // % rate surcharge for LTV 80-90%
            land: 60,
            landWithPermit: 70,
            purposeFree: 70
        },
        loanTerms: {
            minYears: 4,
            maxYears: 30,
            maxAgeAtMaturity: 65
        },
        minLoan: 5000,
        maxLoan: null,  // no published limit, depends on DTI/DSTI
        incomeAcceptance: {
            tpp: true,           // employment contract
            szco: true,          // self-employed
            dohodaOPP: true,     // agreement on work activity
            pension: true,
            maternity: true,
            rental: true,        // rental income
            abroad: true,        // income from abroad
            abroadNote: 'EU + vybrane krajiny, overovanie individualne'
        },
        refinancing: {
            available: true,
            minMonths: 0,
            note: 'Moznost refinancovania kedykolvek'
        },
        specialFeatures: [
            'Najvacsia siet pobociek na Slovensku',
            'George app s kompletnym prehladom',
            'Moznost predcasneho splatenia 20% rocne bez poplatku'
        ],
        notes: 'Najvacsia banka na Slovensku. Kampanove sadzby vyzaduju aktivny ucet a uverove poistenie.'
    },
    {
        id: 'vub',
        name: 'Vseobecna uverova banka',
        shortName: 'VUB',
        color: '#00843d',
        rates: {
            fix1: 4.19,
            fix3: 3.39,
            fix5: 3.59,
            fix10: 4.59,
            fix15: null,
            fix20: null
        },
        campaignRates: {},
        campaignNote: '',
        campaignValidUntil: null,
        discounts: [],
        fees: {
            processing: 0,
            monthlyAccount: 0,
            earlyRepayment: 0,
            earlyRepaymentPenalty: 1,
            propertyValuation: 160,
            extraPaymentFree: 20,
        },
        ltv: {
            standard: 80,
            max: 90,
            surchargeAbove80: 0.40,
            land: 60,
            landWithPermit: 70,
            purposeFree: 70
        },
        loanTerms: {
            minYears: 4,
            maxYears: 30,
            maxAgeAtMaturity: 65
        },
        minLoan: 5000,
        maxLoan: null,
        incomeAcceptance: {
            tpp: true,
            szco: true,
            dohodaOPP: true,
            pension: true,
            maternity: true,
            rental: true,
            abroad: true,
            abroadNote: 'EU krajiny, individualne posudenie'
        },
        refinancing: {
            available: true,
            minMonths: 0,
            note: ''
        },
        specialFeatures: [
            'Sucast skupiny Intesa Sanpaolo',
            'Digitalne podpisovanie zmluv',
            'Flexibilne moznosti mimoriadnych splatok'
        ],
        notes: 'Druha najvacsia banka na Slovensku. Stabilne sadzby bez velkych kampanovych zliav.'
    },
    {
        id: 'tatra',
        name: 'Tatra banka',
        shortName: 'Tatra',
        color: '#1a1f71',
        rates: {
            fix1: 4.09,
            fix3: 3.69,
            fix5: 3.89,
            fix10: 4.69,
            fix15: null,
            fix20: null
        },
        campaignRates: {},
        campaignNote: '',
        campaignValidUntil: '2026-03-22',
        discounts: [],
        fees: {
            processing: 0,
            monthlyAccount: 0,
            earlyRepayment: 0,
            earlyRepaymentPenalty: 1,
            propertyValuation: 180,
            extraPaymentFree: 20,
        },
        ltv: {
            standard: 80,
            max: 90,
            surchargeAbove80: 0.50,
            land: 50,
            landWithPermit: 70,
            purposeFree: 70
        },
        loanTerms: {
            minYears: 4,
            maxYears: 30,
            maxAgeAtMaturity: 65
        },
        minLoan: 5000,
        maxLoan: null,
        incomeAcceptance: {
            tpp: true,
            szco: true,
            dohodaOPP: false,
            pension: true,
            maternity: true,
            rental: true,
            abroad: true,
            abroadNote: 'EU + USA, UK, Svajciarsko'
        },
        refinancing: {
            available: true,
            minMonths: 0,
            note: ''
        },
        specialFeatures: [
            'Premium bankovnictvo pre vyssie prijmy',
            'Tatra banka app - najlepsie hodnotena',
            'Moznost kombinacie s investicnym ucetom'
        ],
        notes: 'Premiova banka s vysokou kvalitou sluzieb. Vyssie poplatky za ohodnotenie.'
    },
    {
        id: 'csob',
        name: 'CSOB',
        shortName: 'CSOB',
        color: '#003b7c',
        rates: {
            fix1: 4.69,
            fix3: 3.40,
            fix5: 3.60,
            fix10: 4.60,
            fix15: null,
            fix20: null
        },
        campaignRates: {},
        campaignNote: '',
        campaignValidUntil: null,
        discounts: [],
        fees: {
            processing: 0,
            monthlyAccount: 0,
            earlyRepayment: 0,
            earlyRepaymentPenalty: 1,
            propertyValuation: 150,
            extraPaymentFree: 20,
        },
        ltv: {
            standard: 80,
            max: 90,
            surchargeAbove80: 0.35,
            land: 60,
            landWithPermit: 70,
            purposeFree: 70
        },
        loanTerms: {
            minYears: 4,
            maxYears: 30,
            maxAgeAtMaturity: 65
        },
        minLoan: 5000,
        maxLoan: null,
        incomeAcceptance: {
            tpp: true,
            szco: true,
            dohodaOPP: true,
            pension: true,
            maternity: true,
            rental: true,
            abroad: true,
            abroadNote: 'EU krajiny'
        },
        refinancing: {
            available: true,
            minMonths: 0,
            note: ''
        },
        specialFeatures: [
            'Sucast skupiny KBC',
            'CSOB SmartBanking',
            'Jednoduchny online proces'
        ],
        notes: 'Silna banka so stabilnymi podmienkami. Vyssia sadzba pri FIX1.'
    },
    {
        id: 'prima',
        name: 'Prima banka',
        shortName: 'Prima',
        color: '#e30613',
        rates: {
            fix1: null,
            fix3: 3.40,
            fix5: 3.60,
            fix10: null,
            fix15: null,
            fix20: null
        },
        campaignRates: {},
        campaignNote: '',
        campaignValidUntil: null,
        discounts: [],
        fees: {
            processing: 0,
            monthlyAccount: 0,
            earlyRepayment: 0,
            earlyRepaymentPenalty: 1,
            propertyValuation: 140,
            extraPaymentFree: 20,
        },
        ltv: {
            standard: 80,
            max: 90,
            surchargeAbove80: 0.50,
            land: 50,
            landWithPermit: 70,
            purposeFree: 70
        },
        loanTerms: {
            minYears: 4,
            maxYears: 30,
            maxAgeAtMaturity: 65
        },
        minLoan: 5000,
        maxLoan: null,
        incomeAcceptance: {
            tpp: true,
            szco: true,
            dohodaOPP: true,
            pension: true,
            maternity: false,
            rental: false,
            abroad: false,
            abroadNote: 'Len prijem zo SR'
        },
        refinancing: {
            available: true,
            minMonths: 6,
            note: 'Min. 6 mesiacov existujuceho uveru'
        },
        specialFeatures: [
            'Jednoduche podmienky',
            'Rychle schvalenie',
            'Nizke poplatky za ohodnotenie'
        ],
        notes: 'Mensia banka s obmedzenym rozsahom fixacii. Neakceptuje prijem zo zahranicia.'
    },
    {
        id: 'unicredit',
        name: 'UniCredit Bank',
        shortName: 'UniCredit',
        color: '#e8002a',
        rates: {
            fix1: null,
            fix3: 3.09,
            fix5: 3.89,
            fix10: null,
            fix15: null,
            fix20: null
        },
        campaignRates: {},
        campaignNote: '',
        campaignValidUntil: null,
        discounts: [],
        fees: {
            processing: 0,
            monthlyAccount: 0,
            earlyRepayment: 0,
            earlyRepaymentPenalty: 1,
            propertyValuation: 170,
            extraPaymentFree: 20,
        },
        ltv: {
            standard: 80,
            max: 90,
            surchargeAbove80: 0.40,
            land: 60,
            landWithPermit: 70,
            purposeFree: 70
        },
        loanTerms: {
            minYears: 4,
            maxYears: 30,
            maxAgeAtMaturity: 65
        },
        minLoan: 10000,
        maxLoan: null,
        incomeAcceptance: {
            tpp: true,
            szco: true,
            dohodaOPP: false,
            pension: true,
            maternity: true,
            rental: true,
            abroad: true,
            abroadNote: 'EU + vyber dalsich krajin'
        },
        refinancing: {
            available: true,
            minMonths: 0,
            note: ''
        },
        specialFeatures: [
            'Najnizsia sadzba FIX3 na trhu (3,09%)',
            'Sucast medzinarodnej skupiny UniCredit',
            'Individualne podmienky pre vyssie uvery'
        ],
        notes: 'Najlepsie FIX3 sadzby na trhu. Obmedzena ponuka fixacii (len 3 a 5 rokov).'
    },
    {
        id: '365bank',
        name: '365.bank',
        shortName: '365.bank',
        color: '#00b0f0',
        rates: {
            fix1: 3.55,
            fix3: 3.35,
            fix5: 3.95,
            fix10: 4.65,
            fix15: null,
            fix20: null
        },
        campaignRates: {},
        campaignNote: '',
        campaignValidUntil: '2026-03-31',
        discounts: [],
        fees: {
            processing: 0,
            monthlyAccount: 0,
            earlyRepayment: 0,
            earlyRepaymentPenalty: 1,
            propertyValuation: 150,
            extraPaymentFree: 20,
        },
        ltv: {
            standard: 80,
            max: 90,
            surchargeAbove80: 0.35,
            land: 60,
            landWithPermit: 70,
            purposeFree: 70
        },
        loanTerms: {
            minYears: 4,
            maxYears: 30,
            maxAgeAtMaturity: 65
        },
        minLoan: 5000,
        maxLoan: null,
        incomeAcceptance: {
            tpp: true,
            szco: true,
            dohodaOPP: true,
            pension: true,
            maternity: true,
            rental: true,
            abroad: true,
            abroadNote: 'EU krajiny'
        },
        refinancing: {
            available: true,
            minMonths: 0,
            note: ''
        },
        specialFeatures: [
            'Plne digitalna banka',
            'Nizka sadzba FIX1 (3,55%)',
            'Rychly online proces bez navstevy pobocky'
        ],
        notes: 'Digitalny naslednik Postovej banky. Dobra ponuka na kratke fixacie.'
    },
    {
        id: 'mbank',
        name: 'mBank',
        shortName: 'mBank',
        color: '#d40511',
        rates: {
            fix1: 4.79,
            fix3: 3.49,
            fix5: 3.89,
            fix10: null,
            fix15: null,
            fix20: null
        },
        campaignRates: {},
        campaignNote: '',
        campaignValidUntil: null,
        discounts: [],
        fees: {
            processing: 0,
            monthlyAccount: 0,
            earlyRepayment: 0,
            earlyRepaymentPenalty: 1,
            propertyValuation: 0,  // often free
            extraPaymentFree: 20,
        },
        ltv: {
            standard: 80,
            max: 90,
            surchargeAbove80: 0.70,
            land: 50,
            landWithPermit: 70,
            purposeFree: 70
        },
        loanTerms: {
            minYears: 5,
            maxYears: 30,
            maxAgeAtMaturity: 65
        },
        minLoan: 10000,
        maxLoan: null,
        incomeAcceptance: {
            tpp: true,
            szco: true,
            dohodaOPP: false,
            pension: true,
            maternity: false,
            rental: true,
            abroad: true,
            abroadNote: 'EU krajiny + individualne'
        },
        refinancing: {
            available: true,
            minMonths: 0,
            note: ''
        },
        specialFeatures: [
            'Online banka - vsetko cez internet',
            'Bezplatne ohodnotenie nehnutelnosti',
            'Nizke poplatky'
        ],
        notes: 'Online banka s dobrymi sadzbami na FIX3. Vyssia prirazka pri LTV > 80%.'
    }
];

/**
 * Helper to get bank by ID
 */
function getBankById(id) {
    return BANKS.find(b => b.id === id);
}

/**
 * Get rate for specific bank and fixation
 */
function getBankRate(bankId, fixation, useCampaign = true) {
    const bank = getBankById(bankId);
    if (!bank) return null;

    const key = 'fix' + fixation;
    if (useCampaign && bank.campaignRates[key] != null) {
        return bank.campaignRates[key];
    }
    return bank.rates[key];
}

/**
 * Get all banks that offer a specific fixation period
 */
function getBanksForFixation(fixation) {
    const key = 'fix' + fixation;
    return BANKS.filter(b => b.rates[key] != null);
}
