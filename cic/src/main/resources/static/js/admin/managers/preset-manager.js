class PresetManager {
    constructor() {
        this.presets = [];
        this.currentCategoryId = null;
        this.elements = {
            addButton: document.getElementById('btnAddPreset'),
            inputContainer: document.getElementById('presetInputContainer'),
            input: document.getElementById('presetQuestionInput'),
            saveButton: document.getElementById('btnSavePreset'),
            cancelButton: document.getElementById('btnCancelPreset'),
            presetList: document.getElementById('presetList'),
            presetCounter: document.getElementById('presetCounter'),
            presetEmptyState: document.getElementById('presetEmptyState')
        };
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.elements.addButton) {
            this.elements.addButton.addEventListener('click', () => this.showAddPreset());
        }

        if (this.elements.saveButton) {
            this.elements.saveButton.addEventListener('click', () => this.savePreset());
        }

        if (this.elements.cancelButton) {
            this.elements.cancelButton.addEventListener('click', () => this.hideAddPreset());
        }

        if (this.elements.input) {
            this.elements.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.savePreset();
                }
            });
        }
    }

    loadPresets(categoryId) {
        this.currentCategoryId = categoryId;
        const category = window.categoryManager.getCategoryById(categoryId);
        this.presets = category && category.presets ? category.presets : [];
        this.render();
    }

    showAddPreset() {
        if (this.elements.inputContainer) {
            this.elements.inputContainer.style.display = 'block';
            this.elements.input.focus();
        }
    }

    hideAddPreset() {
        if (this.elements.inputContainer) {
            this.elements.inputContainer.style.display = 'none';
            this.elements.input.value = '';
        }
    }

    async savePreset() {
        const question = this.elements.input.value.trim();
        if (!question) return;
        if (!this.presets.includes(question)) {
            this.presets.push(question);
            this.render();
            this.hideAddPreset();
        } else {
            alert('This preset question already exists');
        }
    }

    removePreset(question) {
        this.presets = this.presets.filter(preset => preset !== question);
        this.render();
    }

    clearAllPresets() {
        this.presets = [];
        this.render();
    }

    render() {
        if (!this.elements.presetList) return;

        // Update counter
        if (this.elements.presetCounter) {
            this.elements.presetCounter.textContent = this.presets.length;
        }

        // Show/hide empty state
        if (this.elements.presetEmptyState) {
            this.elements.presetEmptyState.style.display = this.presets.length === 0 ? 'block' : 'none';
        }

        // Clear existing presets
        this.elements.presetList.innerHTML = '';

        // Add preset items
        this.presets.forEach(preset => {
            const presetItem = this.createPresetItem(preset);
            this.elements.presetList.appendChild(presetItem);
        });
    }

    createPresetItem(question) {
        const item = document.createElement('div');
        item.className = 'preset-item';
        item.innerHTML = `
            <div class="preset-item-text">
                <svg class="preset-item-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>${this.escapeHtml(question)}</span>
            </div>
            <button class="btn-icon btn-icon-danger preset-remove-btn" title="Remove">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            </button>
        `;

        const removeButton = item.querySelector('.preset-remove-btn');
        removeButton.addEventListener('click', () => {
            this.removePreset(question);
        });

        return item;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getPresets() {
        return this.presets;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    window.presetManager = new PresetManager();
});