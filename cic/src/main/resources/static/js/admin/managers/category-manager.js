class CategoryManager {
    constructor() {
        this.categories = [];
        this.ready = this._waitForResourceLoader();
        this.currentCategory = null;
    }

    async _waitForResourceLoader() {
        // Wait for AdminResourceLoader to be available
        while (!window.AdminResourceLoader) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        // Get categories from centralized loader
        this.categories = await window.AdminResourceLoader.getCategories();
        
        // Listen for category resource updates
        window.AdminResourceLoader.onResourceChange('categories', (categories) => {
            this.categories = categories;
        });
    }

    setCurrentCategory(category) {
        this.currentCategory = category;
        localStorage.setItem('currentCategory', JSON.stringify(category));
    }
    getCurrentCategory() {
        return this.currentCategory;
    }
    
    async addCategory(name) {
        try {
            const response = await window.ApiCaller.postRequest('/api/category/add', { name: name }, true);
            if (response.success) {
                this.categories.push(response.data);
                // Update centralized resource
                window.AdminResourceLoader.updateResource('categories', this.categories);
                if (window.categoriesPage) {
                    window.categoriesPage.render();
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    async deleteCategory(categoryId) {
        try {
            const response = await window.ApiCaller.postRequest('/api/category/delete', { id: categoryId }, true);
            if (response.success) {
                this.categories = this.categories.filter(cat => cat.id !== categoryId);
                // Update centralized resource
                window.AdminResourceLoader.updateResource('categories', this.categories);
                if (window.categoriesPage) {
                    window.categoriesPage.render();
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    async editCategory(categoryId, name, content, presets) {
        try {
            const response = await window.ApiCaller.postRequest('/api/category/update', { id: categoryId, name: name, content: content, presets: presets }, true);
            if (response.success) {
                const updatedCategory = response.data;

                this.categories = this.categories.map(cat =>
                    cat.id === updatedCategory.id ? updatedCategory : cat
                );
                // Update centralized resource
                window.AdminResourceLoader.updateResource('categories', this.categories);
                
                if (content == null) return;
                if (window.categoriesPage) {
                    window.categoriesPage.render();
                }
            } else {
                console.log(response.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    getCategoryById(categoryId) {
        return this.categories.find(cat => cat.id === categoryId) || null;
    }

    updateQueryCount(categoryId, count) {
        const category = this.getCategoryById(categoryId);
        if (category) {
            category.queryCount = count;
        }
    }

    getAllCategories() {
        return this.categories;
    }

    renderCategories(container, onEditClick, onDeleteClick) {
        const addButton = container.querySelector('.btn-add-category');
        container.innerHTML = '';

        this.categories.forEach(category => {
            const categoryCard = this.createCategoryCard(category, onEditClick, onDeleteClick);
            container.appendChild(categoryCard);
        });

        if (addButton) {
            container.appendChild(addButton);
        }
    }

    createCategoryCard(category, onEdit, onDelete) {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.dataset.categoryId = category.id;

        const formattedDate = this.formatDate(category.createdAt);
        const formattedDateUpdate = category.updatedAt ? this.formatDate(category.updatedAt) : 'N/A';
        card.innerHTML = `
          <h3>${this.escapeHtml(category.name)}</h3>
          <p class="timestamp">Created: ${formattedDate} by ${this.escapeHtml(category.createdBy)}</p>
          <p class="timestamp">Updated: ${formattedDateUpdate} by ${this.escapeHtml(category.updatedBy
            ? category.updatedBy : "N/A"
          )}</p>
          <div class="card-actions">
            <button class="btn-edit" aria-label="Edit category">
              <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zm14.71-9.04c.39-.39.39-1.02 0-1.41l-2.54-2.54a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
              Edit
            </button>
            <button class="btn-delete" aria-label="Delete category">
              <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
              Delete
            </button>
          </div>
        `;

        // Handle button actions
        const editButton = card.querySelector('.btn-edit');
        const deleteButton = card.querySelector('.btn-delete');

        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            onEdit(category.id);
        });

        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            onDelete(category.id);
        });

        return card;
    }

    generateId() {
        return 'cat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async load() {
        // Deprecated - use AdminResourceLoader instead
        try {
            this.categories = await window.AdminResourceLoader.getCategories();
            console.log(this.categories)
        } catch (e) {
            console.error('Error loading categories:', e);
            this.categories = [];
        }
    }

    getTotalCount() {
        return this.categories.length;
    }
}

window.categoryManager = new CategoryManager();