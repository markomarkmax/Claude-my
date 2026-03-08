/**
 * Amortization table and RPMN calculation
 */
const Amortization = {
    /**
     * Generate monthly amortization schedule
     */
    generate(principal, annualRate, months, fees = {}) {
        const schedule = [];
        let balance = principal;
        const r = annualRate / 100 / 12;
        const payment = Calculator.annuityPayment(principal, annualRate, months);

        let totalInterest = 0;
        let totalPrincipal = 0;

        for (let month = 1; month <= months; month++) {
            const interestPart = balance * r;
            let principalPart = payment - interestPart;

            // Last month adjustment
            if (month === months) {
                principalPart = balance;
            }

            balance -= principalPart;
            if (balance < 0.01) balance = 0;

            totalInterest += interestPart;
            totalPrincipal += principalPart;

            schedule.push({
                month,
                payment: month === months ? principalPart + interestPart : payment,
                principalPart,
                interestPart,
                balance,
                totalInterest,
                totalPrincipal
            });
        }

        return schedule;
    },

    /**
     * Generate yearly summary from monthly schedule
     */
    yearlySummary(schedule) {
        const yearly = [];
        let yearData = null;

        for (const row of schedule) {
            const year = Math.ceil(row.month / 12);

            if (!yearData || yearData.year !== year) {
                if (yearData) yearly.push(yearData);
                yearData = {
                    year,
                    totalPayment: 0,
                    totalPrincipal: 0,
                    totalInterest: 0,
                    endBalance: 0
                };
            }

            yearData.totalPayment += row.payment;
            yearData.totalPrincipal += row.principalPart;
            yearData.totalInterest += row.interestPart;
            yearData.endBalance = row.balance;
        }

        if (yearData) yearly.push(yearData);
        return yearly;
    },

    /**
     * Calculate RPMN (APR) using Newton-Raphson
     * Finds rate where: sum of PV(payments) = loan amount - fees
     */
    calculateRPMN(principal, monthlyPayment, months, oneTimeFees = 0, monthlyFees = 0) {
        const totalPayment = monthlyPayment + monthlyFees;
        let guess = 0.05; // 5% initial guess

        for (let i = 0; i < 100; i++) {
            let npv = -principal + oneTimeFees;
            let dnpv = 0;

            for (let m = 1; m <= months; m++) {
                const factor = Math.pow(1 + guess, m / 12);
                npv += totalPayment / factor;
                dnpv -= (m / 12) * totalPayment / (factor * (1 + guess));
            }

            if (Math.abs(npv) < 0.001) break;

            const step = npv / dnpv;
            guess -= step;

            if (guess <= -1) guess = 0.001;
        }

        return guess * 100;
    },

    /**
     * Render amortization table to HTML
     */
    renderTable(schedule, mode = 'yearly') {
        const data = mode === 'yearly' ? this.yearlySummary(schedule) : schedule;
        const isYearly = mode === 'yearly';

        let html = '<table class="amort-table"><thead><tr>';
        html += `<th>${isYearly ? 'Rok' : 'Mesiac'}</th>`;
        html += '<th>Splátka</th>';
        html += '<th>Istina</th>';
        html += '<th>Úroky</th>';
        html += '<th>Zostatok</th>';
        html += '</tr></thead><tbody>';

        for (const row of data) {
            const period = isYearly ? row.year : row.month;
            const payment = isYearly ? row.totalPayment : row.payment;
            const principal = isYearly ? row.totalPrincipal : row.principalPart;
            const interest = isYearly ? row.totalInterest : row.interestPart;
            const balance = isYearly ? row.endBalance : row.balance;

            html += '<tr>';
            html += `<td>${period}</td>`;
            html += `<td>${Formatting.eur(payment)}</td>`;
            html += `<td>${Formatting.eur(principal)}</td>`;
            html += `<td>${Formatting.eur(interest)}</td>`;
            html += `<td>${Formatting.eur(balance)}</td>`;
            html += '</tr>';
        }

        html += '</tbody></table>';
        return html;
    }
};
