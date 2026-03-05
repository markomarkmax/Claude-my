/**
 * Chart.js wrappers for mortgage visualization
 */
const Charts = {
    instances: {},

    destroy(id) {
        if (this.instances[id]) {
            this.instances[id].destroy();
            delete this.instances[id];
        }
    },

    destroyAll() {
        Object.keys(this.instances).forEach(id => this.destroy(id));
    },

    /**
     * Pie chart: principal vs interest
     */
    principalVsInterest(canvasId, principal, totalInterest) {
        this.destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        this.instances[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Istina', 'Uroky'],
                datasets: [{
                    data: [principal, totalInterest],
                    backgroundColor: ['#1a56db', '#f59e0b'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function (ctx) {
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = ((ctx.parsed / total) * 100).toFixed(1);
                                return `${ctx.label}: ${Formatting.eur(ctx.parsed)} (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Line chart: principal vs interest over time
     */
    amortizationChart(canvasId, schedule) {
        this.destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const yearly = Amortization.yearlySummary(schedule);
        const labels = yearly.map(y => `Rok ${y.year}`);
        const principalData = yearly.map(y => y.totalPrincipal);
        const interestData = yearly.map(y => y.totalInterest);
        const balanceData = yearly.map(y => y.endBalance);

        this.instances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Splatka istiny (rocne)',
                        data: principalData,
                        borderColor: '#1a56db',
                        backgroundColor: 'rgba(26, 86, 219, 0.1)',
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Uroky (rocne)',
                        data: interestData,
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Zostatok uveru',
                        data: balanceData,
                        borderColor: '#059669',
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.3,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: ctx => `${ctx.dataset.label}: ${Formatting.eur(ctx.parsed.y)}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'EUR (rocne)' },
                        ticks: { callback: v => Formatting.eurShort(v) }
                    },
                    y1: {
                        position: 'right',
                        beginAtZero: true,
                        title: { display: true, text: 'Zostatok' },
                        ticks: { callback: v => Formatting.eurShort(v) },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    },

    /**
     * Bar chart: bank comparison
     */
    bankComparison(canvasId, results, metric = 'monthlyPayment') {
        this.destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const labels = results.map(r => r.bank.shortName);
        const data = results.map(r => r[metric]);
        const colors = results.map(r => r.bank.color);

        const metricLabels = {
            monthlyPayment: 'Mesacna splatka (EUR)',
            totalInterest: 'Celkove uroky (EUR)',
            effectiveRate: 'Efektivna sadzba (%)',
            maxMortgage: 'Max. hypoteka (EUR)'
        };

        this.instances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: metricLabels[metric] || metric,
                    data,
                    backgroundColor: colors.map(c => c + 'cc'),
                    borderColor: colors,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => {
                                if (metric === 'effectiveRate') return Formatting.percent(ctx.parsed.y);
                                return Formatting.eur(ctx.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: metric === 'effectiveRate',
                        ticks: {
                            callback: v => {
                                if (metric === 'effectiveRate') return Formatting.percent(v, 1);
                                return Formatting.eurShort(v);
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Investment scenario chart
     */
    investmentScenarios(canvasId, analysis) {
        this.destroy(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const holdingYears = analysis.params.holdingYears || 10;
        const labels = Array.from({ length: holdingYears + 1 }, (_, i) => `Rok ${i}`);
        const datasets = [];

        const scenarioColors = {
            optimistic: '#059669',
            realistic: '#1a56db',
            pessimistic: '#dc2626'
        };
        const scenarioNames = {
            optimistic: 'Optimisticky',
            realistic: 'Realisticky',
            pessimistic: 'Pesimisticky'
        };

        for (const [name, s] of Object.entries(analysis.scenarios)) {
            const propertyValue = analysis.params.propertyValue;
            const data = labels.map((_, i) =>
                propertyValue * Math.pow(1 + s.appreciation / 100, i)
            );
            datasets.push({
                label: scenarioNames[name],
                data,
                borderColor: scenarioColors[name],
                fill: false,
                tension: 0.3
            });
        }

        this.instances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: ctx => `${ctx.dataset.label}: ${Formatting.eur(ctx.parsed.y)}`
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: { callback: v => Formatting.eurShort(v) }
                    }
                }
            }
        });
    }
};
