/**
 * PDF and CSV export functionality
 */
const Export = {
    /**
     * Export results to PDF using html2pdf.js
     */
    async toPDF() {
        const content = Helpers.$('#results-section');
        if (!content) return;

        // Show loading
        const btn = Helpers.$('#export-pdf-btn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Generujem PDF...';
        }

        try {
            const opt = {
                margin: [10, 10, 10, 10],
                filename: `hypoteka-porovnanie-${new Date().toISOString().split('T')[0]}.pdf`,
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait'
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            await html2pdf().set(opt).from(content).save();
        } catch (err) {
            console.error('PDF export failed:', err);
            alert('Export PDF zlyhal. Skúste to prosím znova.');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Exportovať PDF';
            }
        }
    },

    /**
     * Export comparison to CSV
     */
    toCSV(results) {
        if (!results || results.length === 0) return;

        const headers = [
            'Banka', 'Sadzba (%)', 'Efektívna sadzba (%)', 'Mesačná splátka (EUR)',
            'Celkové úroky (EUR)', 'Celková suma (EUR)', 'Max. hypotéka (EUR)',
            'LTV (%)', 'Schválené', 'Limitujúci faktor'
        ];

        const rows = results.map(r => [
            r.bank.name,
            r.baseRate.toFixed(2),
            r.effectiveRate.toFixed(2),
            r.monthlyPayment.toFixed(2),
            r.totalInterest.toFixed(2),
            r.totalPayment.toFixed(2),
            r.maxMortgage.toFixed(2),
            r.actualLTV.toFixed(1),
            r.approved ? 'Áno' : 'Nie',
            r.limitingFactor
        ]);

        let csv = '\uFEFF'; // BOM for UTF-8 in Excel
        csv += headers.join(';') + '\n';
        rows.forEach(row => {
            csv += row.join(';') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hypoteka-porovnanie-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    },

    /**
     * Export amortization table to CSV
     */
    amortizationCSV(schedule) {
        const headers = ['Mesiac', 'Splátka (EUR)', 'Istina (EUR)', 'Úroky (EUR)', 'Zostatok (EUR)'];

        let csv = '\uFEFF';
        csv += headers.join(';') + '\n';
        schedule.forEach(row => {
            csv += [
                row.month,
                row.payment.toFixed(2),
                row.principalPart.toFixed(2),
                row.interestPart.toFixed(2),
                row.balance.toFixed(2)
            ].join(';') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `amortizacna-tabulka-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }
};
