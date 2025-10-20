class CategoryHandler {
    constructor() {
        // Detect if we're on the chat page
        this.dropdownBtn = document.getElementById('categoryDropdownBtn');
        this.hasChatUI = !!this.dropdownBtn;

        // DOM elements - only initialize if chat UI exists
        this.elements = {};
        if (this.hasChatUI) {
            this.elements = {
                dropdownBtn: this.dropdownBtn,
                dropdownMenu: document.getElementById('categoryDropdownMenu'),
                selectedCategory: document.getElementById('selectedCategory'),
                presetContainer: document.getElementById('presetOptionsContainer'),
                chatInput: document.querySelector('.chat-input'),
            };
        }

        // State
        this.categories = [];
        this.currentCategory = null;
        this.ready = null;
        // Initialize
        this.init();
    }

    async fetchCategories() {
        try {
            window.ApiCaller.setAllowSpinner(false);
            const response = await window.ApiCaller.getRequest('/api/category/getAll', true);
            if (response.success) {
                this.categories = response.data;
                this.selectCategory(response.data[0]);
            } else {
                console.error('Failed to fetch categories:', response.message);
            }
            this.renderCategories();
        } catch (error) {
            console.error('Error fetching categories:', error);
            this.renderCategories();
        }
    }

    renderCategories() {
        if (!this.hasChatUI) return;
        
        const menu = this.elements.dropdownMenu;
        menu.innerHTML = '';

        this.categories.forEach(category => {
            const option = document.createElement('div');
            option.className = 'category-option';
            option.dataset.categoryId = category.id;

            if (category.id === 'all') {
                option.classList.add('selected');
            }

            option.innerHTML = `
                ${category.icon || ''}
                <span>${category.name}</span>
            `;

            option.addEventListener('click', () => this.selectCategory(category));
            menu.appendChild(option);
        });
    }

    selectCategory(category) {
        this.currentCategory = category;
        
        if (!this.hasChatUI) return;
        
        this.elements.selectedCategory.textContent = category.name;

        document.querySelectorAll('.category-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.categoryId === category.id);
        });

        this.closeDropdown();

        if (!category.presets || category.presets.length === 0) {
            this.hidePresetOptions();
        } else {
            this.showPresetOptions(category);
        }
    }

    showPresetOptions(category) {
        if (!this.hasChatUI) return;
        
        const container = this.elements.presetContainer;
        const chatMessages = document.querySelector('.chat-messages');
        
        if (!container) {
            console.error('Preset container not found!');
            return;
        }

        if (!chatMessages) {
            console.error('Chat messages container not found!');
            return;
        }
        
        // Always move the container to the bottom of chat-messages
        if (!container.isConnected || container.parentNode !== chatMessages) {
            chatMessages.appendChild(container);
        }
        
        container.style.display = 'block';

        container.innerHTML = `
            <div class="preset-options-header">
                <div class="preset-options-title">
                    <svg class="preset-icon" xmlns="http://www.w3.org/2000/svg" 
                         viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5
                                 c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14
                                 c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0
                                 16H5V9h14v11z"/>
                    </svg>
                    <span>Quick Questions: ${category.name}</span>
                </div>
            </div>
            <div class="preset-options-grid" id="presetOptionsGrid"></div>
        `;

        const grid = container.querySelector('#presetOptionsGrid');
        if (!grid) {
            console.error('Grid element not found after innerHTML set!');
            return;
        }

        category.presets.forEach((preset, index) => {
            const option = document.createElement('div');
            option.className = 'preset-option';
            option.innerHTML = `
                <div class="preset-option-text">
                    <svg class="preset-option-icon" xmlns="http://www.w3.org/2000/svg" 
                         viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 
                                 10 6l6 6-6 6-1.41-1.41z"/>
                    </svg>
                    <span>${preset}</span>
                </div>
            `;
            option.addEventListener('click', () => this.handlePresetClick(preset));
            grid.appendChild(option);
        });

        // Scroll to show the preset options at the bottom
        setTimeout(() => {
            // Scroll chat messages to bottom to show the preset options
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }

    hidePresetOptions() {
        if (!this.hasChatUI) return;
        
        const container = this.elements.presetContainer;
        container.style.display = 'none';
        container.innerHTML = '';
    }

    handlePresetClick(presetText) {
        if (!this.hasChatUI) return;
        
        const { chatInput } = this.elements;
        chatInput.value = presetText;
        chatInput.focus();

        const sendButton = document.querySelector('.send-button');
        if (sendButton) sendButton.click();

        this.hidePresetOptions();
    }

    toggleDropdown() {
        if (!this.hasChatUI) return;
        
        const isExpanded = this.elements.dropdownBtn.getAttribute('aria-expanded') === 'true';
        isExpanded ? this.closeDropdown() : this.openDropdown();
    }

    openDropdown() {
        if (!this.hasChatUI) return;
        
        this.elements.dropdownMenu.classList.add('active');
        this.elements.dropdownBtn.setAttribute('aria-expanded', 'true');
    }

    closeDropdown() {
        if (!this.hasChatUI) return;
        
        this.elements.dropdownMenu.classList.remove('active');
        this.elements.dropdownBtn.setAttribute('aria-expanded', 'false');
    }

    handleClickOutside = (event) => {
        if (!this.hasChatUI) return;
        
        if (!this.elements.dropdownBtn.contains(event.target) && 
            !this.elements.dropdownMenu.contains(event.target)) {
            this.closeDropdown();
        }
    };

    setupEventListeners() {
        if (!this.hasChatUI) return;
        
        this.elements.dropdownBtn.addEventListener('click', () => this.toggleDropdown());
        document.addEventListener('click', this.handleClickOutside);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeDropdown();
        });
    }

    init() {
        this.ready = this.fetchCategories();
        this.setupEventListeners();
        
        if (this.hasChatUI) {
            this.elements.dropdownBtn.setAttribute('aria-expanded', 'false');
        }

        // Optionally expose instance for debugging or other scripts
        window.CategoryHandlerInstance = this;
    }

    // Public getters
    getCurrentCategory() {
        return this.currentCategory;
    }
}

document.addEventListener('DOMContentLoaded', () => window.categoryHandler =new CategoryHandler());
