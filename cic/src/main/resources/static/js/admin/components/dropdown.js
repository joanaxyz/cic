class AdminDropdown {
    constructor(dropdownElement) {
        this.dropdown = dropdownElement;
        this.toggle = this.dropdown.querySelector('.dropdown-toggle');
        this.menu = this.dropdown.querySelector('.dropdown-menu');
        this.items = this.dropdown.querySelectorAll('.dropdown-item');
        
        this.isOpen = false;
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.toggle) {
            this.toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggle();
            });
        }

        this.items.forEach(item => {
            item.addEventListener('click', (e) => {
                const value = e.target.dataset.value;
                const text = e.target.textContent;
                this.selectItem(value, text);
                this.hide();
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.dropdown.contains(e.target)) {
                this.hide();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.hide();
            }
        });
    }

    toggle() {
        if (this.isOpen) {
            this.hide();
        } else {
            this.show();
        }
    }

    show() {
        this.menu.style.display = 'block';
        this.dropdown.classList.add('open');
        this.isOpen = true;
    }

    hide() {
        this.menu.style.display = 'none';
        this.dropdown.classList.remove('open');
        this.isOpen = false;
    }

    selectItem(value, text) {
        // Update the toggle text if needed
        if (this.toggle) {
            const toggleText = this.toggle.querySelector('.dropdown-text');
            if (toggleText) {
                toggleText.textContent = text;
            }
        }

        // Trigger custom event
        const event = new CustomEvent('dropdown:select', {
            detail: { value, text }
        });
        this.dropdown.dispatchEvent(event);
    }

    static init() {
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            if (!dropdown.adminDropdown) {
                dropdown.adminDropdown = new AdminDropdown(dropdown);
            }
        });
    }
}

// Auto-initialize dropdowns
document.addEventListener('DOMContentLoaded', () => {
    AdminDropdown.init();
});

window.AdminDropdown = AdminDropdown;