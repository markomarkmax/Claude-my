/**
 * Client/Advisor mode switching
 */
const Mode = {
    current: 'client',

    init() {
        const toggle = Helpers.$('#mode-toggle');
        if (toggle) {
            toggle.addEventListener('change', () => this.toggle());
        }

        // Load saved preference
        const saved = localStorage.getItem('mortgageMode');
        if (saved === 'advisor') {
            this.current = 'advisor';
            if (toggle) toggle.checked = true;
        }

        this.apply();
    },

    toggle() {
        this.current = this.current === 'client' ? 'advisor' : 'client';
        localStorage.setItem('mortgageMode', this.current);
        this.apply();
    },

    apply() {
        document.documentElement.setAttribute('data-mode', this.current);

        const label = Helpers.$('#mode-label');
        if (label) {
            label.textContent = this.current === 'client' ? 'Klientsky rezim' : 'Poradensky rezim';
        }

        // Re-render results if they exist
        if (Comparison.currentResults.length > 0) {
            Comparison.render(Comparison.currentResults, this.current);
        }
    },

    isAdvisor() {
        return this.current === 'advisor';
    }
};
