/**
 * Complete bank data for 8 Slovak banks
 * Source: Verejné sadzobníky bánk, marec 2026
 * Update: Manually edit this file when rates change
 */
const BANKS = [
    {
        id: 'slsp',
        name: 'Slovenská sporiteľňa',
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
        campaignNote: 'FIX 3: 3,19% so zľavami za účet (−0,5%) a úverové poistenie (−0,2%) pri max 80% LTV',
        campaignValidUntil: '2026-04-30',
        discounts: [
            { name: 'Účet v SLSP', value: -0.50 },
            { name: 'Úverové poistenie', value: -0.20 }
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
            abroadNote: 'EÚ + vybrané krajiny, overovanie individuálne'
        },
        refinancing: {
            available: true,
            minMonths: 0,
            note: 'Možnosť refinancovania kedykoľvek'
        },
        specialFeatures: [
            'Najväčšia sieť pobočiek na Slovensku',
            'George app s kompletným prehľadom',
            'Možnosť predčasného splatenia 20% ročne bez poplatku'
        ],
        notes: 'Najväčšia banka na Slovensku. Kampaňové sadzby vyžadujú aktívny účet a úverové poistenie.'
    },
    {
        id: 'vub',
        name: 'Všeobecná úverová banka',
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
            abroadNote: 'EÚ krajiny, individuálne posúdenie'
        },
        refinancing: {
            available: true,
            minMonths: 0,
            note: ''
        },
        specialFeatures: [
            'Súčasť skupiny Intesa Sanpaolo',
            'Digitálne podpisovanie zmlúv',
            'Flexibilné možnosti mimoriadnych splátok'
        ],
        notes: 'Druhá najväčšia banka na Slovensku. Stabilné sadzby bez veľkých kampaňových zliav.'
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
            abroadNote: 'EÚ + USA, UK, Švajčiarsko'
        },
        refinancing: {
            available: true,
            minMonths: 0,
            note: ''
        },
        specialFeatures: [
            'Prémiové bankovníctvo pre vyššie príjmy',
            'Tatra banka app – najlepšie hodnotená',
            'Možnosť kombinácie s investičným účtom'
        ],
        notes: 'Prémiová banka s vysokou kvalitou služieb. Vyššie poplatky za ohodnotenie.'
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
            abroadNote: 'EÚ krajiny'
        },
        refinancing: {
            available: true,
            minMonths: 0,
            note: ''
        },
        specialFeatures: [
            'Súčasť skupiny KBC',
            'ČSOB SmartBanking',
            'Jednoduchý online proces'
        ],
        notes: 'Silná banka so stabilnými podmienkami. Vyššia sadzba pri FIX1.'
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
            abroadNote: 'Len príjem zo SR'
        },
        refinancing: {
            available: true,
            minMonths: 6,
            note: 'Min. 6 mesiacov existujúceho úveru'
        },
        specialFeatures: [
            'Jednoduché podmienky',
            'Rýchle schválenie',
            'Nízke poplatky za ohodnotenie'
        ],
        notes: 'Menšia banka s obmedzeným rozsahom fixácií. Neakceptuje príjem zo zahraničia.'
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
            abroadNote: 'EÚ + výber ďalších krajín'
        },
        refinancing: {
            available: true,
            minMonths: 0,
            note: ''
        },
        specialFeatures: [
            'Najnižšia sadzba FIX3 na trhu (3,09%)',
            'Súčasť medzinárodnej skupiny UniCredit',
            'Individuálne podmienky pre vyššie úvery'
        ],
        notes: 'Najlepšie FIX3 sadzby na trhu. Obmedzená ponuka fixácií (len 3 a 5 rokov).'
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
            abroadNote: 'EÚ krajiny'
        },
        refinancing: {
            available: true,
            minMonths: 0,
            note: ''
        },
        specialFeatures: [
            'Plne digitálna banka',
            'Nízka sadzba FIX1 (3,55%)',
            'Rýchly online proces bez návštevy pobočky'
        ],
        notes: 'Digitálny nástupca Poštovej banky. Dobrá ponuka na krátke fixácie.'
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
            abroadNote: 'EÚ krajiny + individuálne'
        },
        refinancing: {
            available: true,
            minMonths: 0,
            note: ''
        },
        specialFeatures: [
            'Online banka – všetko cez internet',
            'Bezplatné ohodnotenie nehnuteľnosti',
            'Nízke poplatky'
        ],
        notes: 'Online banka s dobrými sadzbami na FIX3. Vyššia prirážka pri LTV > 80%.'
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
