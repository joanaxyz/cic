/**
 * ResourceLoadingIndicator - Shows loading progress for admin resources
 */
class ResourceLoadingIndicator {
    constructor() {
        this.container = null;
        this.progressBar = null;
        this.statusText = null;
        this.isVisible = false;
        this.loadingResources = new Set();
        this.init();
    }

    init() {
        this.createIndicator();
        this.setupResourceListeners();
    }

    createIndicator() {
        // Create container
        this.container = document.createElement('div');
        this.container.className = 'admin-loading-indicator';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: var(--primary-color, #007bff);
            color: white;
            padding: 8px 16px;
            font-size: 14px;
            z-index: 9999;
            transform: translateY(-100%);
            transition: transform 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: space-between;
        `;

        // Create status text
        this.statusText = document.createElement('span');
        this.statusText.textContent = 'Loading admin resources...';

        // Create progress bar
        const progressContainer = document.createElement('div');
        progressContainer.style.cssText = `
            width: 200px;
            height: 4px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 2px;
            overflow: hidden;
        `;

        this.progressBar = document.createElement('div');
        this.progressBar.style.cssText = `
            height: 100%;
            background: white;
            border-radius: 2px;
            transition: width 0.3s ease;
            width: 0%;
        `;

        progressContainer.appendChild(this.progressBar);

        this.container.appendChild(this.statusText);
        this.container.appendChild(progressContainer);

        // Add to body
        document.body.appendChild(this.container);
    }

    setupResourceListeners() {
        // Wait for AdminResourceLoader
        const checkForLoader = () => {
            if (window.AdminResourceLoader) {
                this.attachListeners();
            } else {
                setTimeout(checkForLoader, 10);
            }
        };
        checkForLoader();
    }

    attachListeners() {
        const loader = window.AdminResourceLoader;

        // Monitor loading states
        const originalLoadUsers = loader.loadUsers.bind(loader);
        const originalLoadCategories = loader.loadCategories.bind(loader);
        const originalLoadStats = loader.loadStats.bind(loader);

        loader.loadUsers = async () => {
            this.startResourceLoad('users');
            try {
                const result = await originalLoadUsers();
                this.completeResourceLoad('users');
                return result;
            } catch (error) {
                this.completeResourceLoad('users');
                throw error;
            }
        };

        loader.loadCategories = async () => {
            this.startResourceLoad('categories');
            try {
                const result = await originalLoadCategories();
                this.completeResourceLoad('categories');
                return result;
            } catch (error) {
                this.completeResourceLoad('categories');
                throw error;
            }
        };

        loader.loadStats = async () => {
            this.startResourceLoad('stats');
            try {
                const result = await originalLoadStats();
                this.completeResourceLoad('stats');
                return result;
            } catch (error) {
                this.completeResourceLoad('stats');
                throw error;
            }
        };

        // Show indicator when initialization starts
        if (!loader.isInitialized) {
            this.show();
        }

        // Hide when all resources are loaded
        const checkCompletion = () => {
            if (loader.areAllResourcesLoaded()) {
                setTimeout(() => this.hide(), 500); // Small delay to show completion
            } else {
                setTimeout(checkCompletion, 100);
            }
        };
        checkCompletion();
    }

    startResourceLoad(resourceType) {
        this.loadingResources.add(resourceType);
        this.show();
        this.updateProgress();
    }

    completeResourceLoad(resourceType) {
        this.loadingResources.delete(resourceType);
        this.updateProgress();
        
        if (this.loadingResources.size === 0) {
            this.statusText.textContent = 'Admin resources loaded successfully!';
            setTimeout(() => this.hide(), 1000);
        }
    }

    updateProgress() {
        const totalResources = 3; // users, categories, stats
        const completed = totalResources - this.loadingResources.size;
        const progress = (completed / totalResources) * 100;

        this.progressBar.style.width = `${progress}%`;

        if (this.loadingResources.size > 0) {
            const loadingList = Array.from(this.loadingResources).join(', ');
            this.statusText.textContent = `Loading ${loadingList}...`;
        }
    }

    show() {
        if (!this.isVisible) {
            this.isVisible = true;
            this.container.style.transform = 'translateY(0)';
        }
    }

    hide() {
        if (this.isVisible) {
            this.isVisible = false;
            this.container.style.transform = 'translateY(-100%)';
        }
    }

    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.adminLoadingIndicator = new ResourceLoadingIndicator();
});