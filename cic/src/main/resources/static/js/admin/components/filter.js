class FilterComponent {
    constructor(options) {
        this.toggleBtn = options.toggleBtn;
        this.panel = options.panel;
        this.options = options.options;
        this.searchInput = options.searchInput;
        this.clearBtn = options.clearBtn;
        this.onFilterChange = options.onFilterChange;
        
        // Initialize filter state
        this.filters = {
            role: 'all',
            login: 'all',
            banned: 'all',
            search: ''
        };
        
        this.init();
    }
    
    init() {
        // Toggle filter panel
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => {
                this.togglePanel();
            });
        }
        
        // Handle filter option clicks
        if (this.options) {
            this.options.forEach(option => {
                option.addEventListener('click', () => {
                    this.selectFilter(option);
                });
            });
        }
        
        // Handle search input with debouncing
        if (this.searchInput) {
            let searchTimeout;
            this.searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filters.search = e.target.value.trim();
                    this.triggerFilterChange();
                }, 300);
            });
        }
        
        // Handle clear filters button
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
        
        // Close filter panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.panel.contains(e.target) && !this.toggleBtn.contains(e.target)) {
                this.panel.classList.remove('active');
            }
        });
    }
    
    togglePanel() {
        if (this.panel) {
            this.panel.classList.toggle('active');
        }
    }
    
    selectFilter(option) {
        const filterType = option.dataset.filterType;
        const value = option.dataset.value;
        
        // Update active state within the same filter type
        const sameTypeOptions = Array.from(this.options).filter(opt => 
            opt.dataset.filterType === filterType
        );
        
        sameTypeOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        // Update filter state
        this.filters[filterType] = value;
        
        this.triggerFilterChange();
    }
    
    triggerFilterChange() {
        if (this.onFilterChange) {
            this.onFilterChange(this.filters);
        }
    }
    
    getCurrentFilters() {
        return { ...this.filters };
    }
    
    clearAllFilters() {
        // Reset filter state
        this.filters = {
            role: 'all',
            login: 'all',
            banned: 'all',
            search: ''
        };
        
        // Reset UI
        this.options.forEach(option => {
            option.classList.remove('active');
            if (option.dataset.value === 'all') {
                option.classList.add('active');
            }
        });
        
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        
        this.triggerFilterChange();
    }
    
    reset() {
        this.clearAllFilters();
    }
}

window.FilterComponent = FilterComponent;