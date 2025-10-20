/**
 * Search Overlay Component
 * Handles search functionality with filters, keyboard navigation, and dynamic results
 */

class SearchOverlay {
    constructor() {
        this.elements = {
            overlay: document.getElementById('searchOverlay'),
            backdrop: document.getElementById('searchOverlayBackdrop'),
            input: document.getElementById('searchOverlayInput'),
            clearBtn: document.getElementById('searchOverlayClear'),
            closeBtn: document.getElementById('searchOverlayClose'),
            emptyState: document.getElementById('searchEmptyState'),
            noResults: document.getElementById('searchNoResults'),
            resultsList: document.getElementById('searchResultsList'),
            filtersContainer: document.querySelector('.search-overlay-filters'),
            filterBtns: null
        };

        this.state = {
            isOpen: false,
            currentFilter: 'all',
            searchTerm: '',
            results: [],
            selectedIndex: -1,
            isSearching: false
        };

        this.searchTimeout = null;
        this.searchDelay = 300; // ms

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.setupFilterButtons();
    }

    setupEventListeners() {
        // Close overlay
        this.elements.closeBtn.addEventListener('click', () => this.close());
        this.elements.backdrop.addEventListener('click', () => this.close());

        // Clear search
        this.elements.clearBtn.addEventListener('click', () => this.clearSearch());

        // Search input
        this.elements.input.addEventListener('input', (e) => this.handleSearchInput(e));
        this.elements.input.addEventListener('keydown', (e) => this.handleKeyNavigation(e));
    }

    async setupFilterButtons() {
        await window.categoryHandler.ready;
        const categories = window.categoryHandler.categories;
        console.log("categories in search: ", categories);
        const button = document.createElement('button');
            button.className = 'search-filter-btn';
            button.textContent = 'All';
            button.dataset.filter = 'all';
            button.classList.add('active');
            this.elements.filtersContainer.appendChild(button);

        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'search-filter-btn';
            button.textContent = category.name;
            button.dataset.filter = category.name.toLowerCase();
            this.elements.filtersContainer.appendChild(button);
        });

        this.filterBtns = Array.from(document.querySelectorAll('.search-filter-btn'));

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e));
        })
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to open search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.open();
            }

            // Escape to close
            if (e.key === 'Escape' && this.state.isOpen) {
                this.close();
            }
        });
    }

    open() {
        this.state.isOpen = true;
        this.elements.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus input after animation
        setTimeout(() => {
            this.elements.input.focus();
        }, 100);
    }

    close() {
        this.state.isOpen = false;
        this.elements.overlay.classList.remove('active');
        document.body.style.overflow = '';
        this.clearSearch();
    }

    clearSearch() {
        this.elements.input.value = '';
        this.state.searchTerm = '';
        this.state.selectedIndex = -1;
        this.elements.clearBtn.classList.remove('visible');
        this.showEmptyState();
    }

    handleSearchInput(e) {
        const value = e.target.value.trim();
        this.state.searchTerm = value;

        // Show/hide clear button
        if (value) {
            this.elements.clearBtn.classList.add('visible');
        } else {
            this.elements.clearBtn.classList.remove('visible');
            this.showEmptyState();
            return;
        }

        // Debounce search
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.performSearch(value);
        }, this.searchDelay);
    }

    handleFilterChange(e) {
        const btn = e.currentTarget;
        const filter = btn.dataset.filter;

        this.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.state.currentFilter = filter;

        // Re-filter results if search is active
        if (this.state.searchTerm) {
            this.filterResults();
        }
    }

    handleKeyNavigation(e) {
        const results = this.elements.resultsList.querySelectorAll('.search-result-item');
        
        if (results.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.state.selectedIndex = Math.min(this.state.selectedIndex + 1, results.length - 1);
                this.updateSelection(results);
                break;

            case 'ArrowUp':
                e.preventDefault();
                this.state.selectedIndex = Math.max(this.state.selectedIndex - 1, -1);
                this.updateSelection(results);
                break;

            case 'Enter':
                e.preventDefault();
                if (this.state.selectedIndex >= 0) {
                    results[this.state.selectedIndex].click();
                }
                break;
        }
    }

    updateSelection(results) {
        results.forEach((result, index) => {
            if (index === this.state.selectedIndex) {
                result.classList.add('selected');
                result.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                result.classList.remove('selected');
            }
        });
    }

    async performSearch(query) {
        if (!query) return;

        this.showLoadingState();

        try {
            const chats = await window.ChatManager.chats;
            console.log("chats in searc", chats);
            const messages = chats
              .map(chat => 
                chat.messages.map(m => ({
                  ...m,          
                  chatId: chat.id
                }))
              )
              .flat();

            const filtered = messages.filter(m => 
                    m.userMessage.toLowerCase().includes(query.toLowerCase())
                    || m.botMessage.toLowerCase().includes(query.toLowerCase())
            );

            this.state.results = filtered;
            this.filterResults();

        } catch (error) {
            console.error('Search error:', error);
            this.showNoResults();
        }
    }

    filterResults() {
        let filtered = this.state.results;
                
        if (this.state.currentFilter !== 'all') {
            filtered = filtered.filter(result => result.category.toLowerCase() === this.state.currentFilter);
        }

        if (filtered.length === 0) {
            this.showNoResults();
        } else {
            this.displayResults(filtered);
        }
    }

    displayResults(results) {
        this.hideAllStates();
        this.elements.resultsList.style.display = 'flex';
        this.elements.resultsList.innerHTML = '';

        results.forEach((result, index) => {
            const resultElement = this.createResultElement(result, index);
            this.elements.resultsList.appendChild(resultElement);
        });

        this.state.selectedIndex = -1;
    }

    createResultElement(result, index) {
        const div = document.createElement('div');
        div.className = 'search-result-item';
        div.dataset.index = index;

        // Highlight search term in title and snippet
        const highlightedTitle = this.highlightText(result.category, this.state.searchTerm);
        let type = 'Bot Message';
        const message = result.userMessage.includes(this.state.searchTerm) ?
        (type = 'User Message', result.userMessage) :
        (type = 'Bot Message', result.botMessage);
                
        // result.userMessage.includes(this.state.searchTerm) ? result.userMessage : result.botMessage;

        const highlightedSnippet = this.highlightText(message, this.state.searchTerm);

        div.innerHTML = `
            <div class="search-result-header">
                <span class="search-result-type ${result.category}">
                    ${this.getTypeIcon(type)}
                    ${type}
                </span>
                <span class="search-result-date">${this.formatDate(result.timestamp)}</span>
            </div>
            <div class="search-result-title">${highlightedTitle}</div>
            <div class="search-result-snippet">${highlightedSnippet}</div>
        `;

        div.addEventListener('click', () => this.handleResultClick(result.chatId, message));

        return div;
    }

    getTypeIcon(type) {
        switch (type) {
            case 'User Message':
                return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zM4 20c0-2.2 3.6-4 8-4s8 1.8 8 4v1H4v-1z"/></svg>';
            case 'Bot Message':
                return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="12" rx="2"/><circle cx="8" cy="9" r="1.2"/><circle cx="16" cy="9" r="1.2"/><rect x="9" y="12.5" width="6" height="1.2" rx="0.6"/><rect x="7" y="18" width="10" height="2" rx="1"/></svg>';
            default:
                return '';
        }
    }

    highlightText(text, query) {
        if (!query) return text;

        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<span class="search-result-highlight">$1</span>');
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    formatDate(date) {
        console.log("date in format date:", date);
        const now = new Date();
        const resultDate = new Date(date + "Z");
        const diffTime = Math.abs(now - resultDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    }

    handleResultClick(id, searchMessage) {
        window.location.href = `/cic/chatbot?id=${id}&highlight=${encodeURIComponent(searchMessage)}`;
        this.close();
    }

    showEmptyState() {
        this.hideAllStates();
        this.elements.emptyState.style.display = 'flex';
    }

    showNoResults() {
        this.hideAllStates();
        this.elements.noResults.style.display = 'flex';
    }

    showLoadingState() {
        this.hideAllStates();
        this.elements.resultsList.style.display = 'flex';
        this.elements.resultsList.innerHTML = `
            <div class="search-loading">
                <div class="search-loading-spinner"></div>
                <div class="search-loading-text">Searching...</div>
            </div>
        `;
    }

    hideAllStates() {
        this.elements.emptyState.style.display = 'none';
        this.elements.noResults.style.display = 'none';
        this.elements.resultsList.style.display = 'none';
    }

    // Public method to trigger search from external sources
    triggerSearch(query = '') {
        this.open();
        if (query) {
            this.elements.input.value = query;
            this.state.searchTerm = query;
            this.elements.clearBtn.classList.add('visible');
            this.performSearch(query);
        }
    }
}

// Initialize search overlay when DOM is ready
let searchOverlay;

document.addEventListener('DOMContentLoaded', () => {
    searchOverlay = new SearchOverlay();

    // Optional: Connect to existing search input in sidebar
    const sidebarSearchInput = document.querySelector('.search-btn');
    if (sidebarSearchInput) {
        sidebarSearchInput.addEventListener('focus', () => {
            searchOverlay.open();
            // Transfer any existing value
            if (sidebarSearchInput.value) {
                searchOverlay.triggerSearch(sidebarSearchInput.value);
            }
            sidebarSearchInput.blur();
        });
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchOverlay;
}