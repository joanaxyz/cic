class PaginationComponent {
    constructor(options) {
        this.container = options.container;
        this.info = options.info;
        this.numbers = options.numbers;
        this.firstBtn = options.firstBtn;
        this.prevBtn = options.prevBtn;
        this.nextBtn = options.nextBtn;
        this.lastBtn = options.lastBtn;
        this.itemsPerPage = options.itemsPerPage || 10;
        this.onPageChange = options.onPageChange;
        
        this.currentPage = 1;
        this.totalItems = 0;
        this.totalPages = 0;
        
        this.init();
    }
    
    init() {
        // Add event listeners
        if (this.firstBtn) {
            this.firstBtn.addEventListener('click', () => this.goToPage(1));
        }
        
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.goToPage(this.currentPage + 1));
        }
        
        if (this.lastBtn) {
            this.lastBtn.addEventListener('click', () => this.goToPage(this.totalPages));
        }
    }
    
    update(totalItems) {
        this.totalItems = totalItems;
        this.totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        // Show/hide pagination
        if (this.container) {
            if (this.totalPages <= 1) {
                this.container.style.display = 'none';
            } else {
                this.container.style.display = 'flex';
            }
        }
        
        // Ensure current page is valid
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = this.totalPages;
        } else if (this.currentPage < 1) {
            this.currentPage = 1;
        }
        
        this.updateInfo();
        this.updateNumbers();
        this.updateButtons();
    }
    
    updateInfo() {
        if (!this.info) return;
        
        const start = Math.min((this.currentPage - 1) * this.itemsPerPage + 1, this.totalItems);
        const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
        
        if (this.totalItems === 0) {
            this.info.textContent = 'No items found';
        } else {
            this.info.textContent = `Showing ${start}-${end} of ${this.totalItems}`;
        }
    }
    
    updateNumbers() {
        if (!this.numbers) return;
        
        this.numbers.innerHTML = '';
        
        if (this.totalPages <= 1) return;
        
        const maxVisible = 5;
        let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(this.totalPages, start + maxVisible - 1);
        
        // Adjust start if we're near the end
        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }
        
        // Add first page if not visible
        if (start > 1) {
            this.createPageButton(1);
            if (start > 2) {
                this.createEllipsis();
            }
        }
        
        // Add visible page numbers
        for (let i = start; i <= end; i++) {
            this.createPageButton(i);
        }
        
        // Add last page if not visible
        if (end < this.totalPages) {
            if (end < this.totalPages - 1) {
                this.createEllipsis();
            }
            this.createPageButton(this.totalPages);
        }
    }
    
    createPageButton(page) {
        const button = document.createElement('button');
        button.className = 'pagination-number';
        button.textContent = page;
        
        if (page === this.currentPage) {
            button.classList.add('active');
        }
        
        button.addEventListener('click', () => this.goToPage(page));
        this.numbers.appendChild(button);
    }
    
    createEllipsis() {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'pagination-ellipsis';
        ellipsis.textContent = '...';
        this.numbers.appendChild(ellipsis);
    }
    
    updateButtons() {
        if (this.firstBtn) {
            this.firstBtn.disabled = this.currentPage === 1;
        }
        
        if (this.prevBtn) {
            this.prevBtn.disabled = this.currentPage === 1;
        }
        
        if (this.nextBtn) {
            this.nextBtn.disabled = this.currentPage === this.totalPages || this.totalPages === 0;
        }
        
        if (this.lastBtn) {
            this.lastBtn.disabled = this.currentPage === this.totalPages || this.totalPages === 0;
        }
    }
    
    goToPage(page) {
        if (page < 1 || page > this.totalPages || page === this.currentPage) {
            return;
        }
        
        this.currentPage = page;
        
        if (this.onPageChange) {
            this.onPageChange(page);
        }
        
        this.updateInfo();
        this.updateNumbers();
        this.updateButtons();
    }
    
    getPaginatedItems(items) {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return items.slice(start, end);
    }
    
    getCurrentPage() {
        return this.currentPage;
    }
    
    getTotalPages() {
        return this.totalPages;
    }
    
    reset() {
        this.currentPage = 1;
        this.update(this.totalItems);
    }
}

window.PaginationComponent = PaginationComponent;