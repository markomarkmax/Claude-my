/**
 * Main application entry point
 */
const App = {
    init() {
        // Initialize mode toggle
        Mode.init();

        // Initialize wizard
        Wizard.init();

        // Initialize glossary tooltips
        Glossary.init();

        // Initialize modal close on outside click
        Comparison.initModal();

        // Navigation
        this.bindNavigation();

        // Export buttons
        this.bindExports();

        // Amortization table toggle
        this.bindAmortizationToggle();

        // Show wizard by default
        this.showSection('wizard');
    },

    bindNavigation() {
        Helpers.$$('[data-nav]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.nav;
                this.showSection(section);

                Helpers.$$('[data-nav]').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    },

    showSection(sectionId) {
        Helpers.$$('.app-section').forEach(s => s.classList.remove('active'));
        const section = Helpers.$(`#section-${sectionId}`);
        if (section) {
            section.classList.add('active');
        }

        // Render glossary when shown
        if (sectionId === 'glossary') {
            Glossary.render();
        }
    },

    bindExports() {
        const pdfBtn = Helpers.$('#export-pdf-btn');
        if (pdfBtn) {
            pdfBtn.addEventListener('click', () => Export.toPDF());
        }

        const csvBtn = Helpers.$('#export-csv-btn');
        if (csvBtn) {
            csvBtn.addEventListener('click', () => Export.toCSV(Comparison.currentResults));
        }

        const amortCsvBtn = Helpers.$('#export-amort-csv-btn');
        if (amortCsvBtn) {
            amortCsvBtn.addEventListener('click', () => {
                const best = Comparison.currentResults.find(r => r.approved);
                if (best) {
                    const schedule = Amortization.generate(
                        best.actualLoan, best.effectiveRate,
                        Wizard.data.loanTermYears * 12
                    );
                    Export.amortizationCSV(schedule);
                }
            });
        }
    },

    bindAmortizationToggle() {
        const toggleBtn = Helpers.$('#amort-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const table = Helpers.$('#amortization-table');
                const isYearly = toggleBtn.dataset.mode === 'yearly';
                const newMode = isYearly ? 'monthly' : 'yearly';
                toggleBtn.dataset.mode = newMode;
                toggleBtn.textContent = newMode === 'yearly' ? 'Zobrazit mesacne' : 'Zobrazit rocne';

                const best = Comparison.currentResults.find(r => r.approved);
                if (best && table) {
                    const schedule = Amortization.generate(
                        best.actualLoan, best.effectiveRate,
                        Wizard.data.loanTermYears * 12
                    );
                    table.innerHTML = Amortization.renderTable(schedule, newMode);
                }
            });
        }
    }
};

// Start app
document.addEventListener('DOMContentLoaded', () => App.init());
