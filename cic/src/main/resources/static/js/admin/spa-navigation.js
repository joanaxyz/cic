/**
 * SPA Navigation Manager - Handles client-side routing without page reloads
 * Provides instant navigation while maintaining URL synchronization
 */
class SPANavigationManager {
    constructor() {
        this.elements = {
            navItems: document.querySelectorAll('.nav-item'),
            pages: document.querySelectorAll('.admin-page')
        };

        this.state = {
            currentPage: null,
            pageInstances: {
                dashboard: null,
                categories: null,
                users: null,
                editor: null
            },
            isInitialized: false
        };

        this.routes = {
            'dashboard': 'dashboard-page',
            'categories': 'categories-page',
            'users': 'users-page',
            'editor': 'editor-page'
        };
    }

    async init() {
        if (this.state.isInitialized) return;

        window.MessageBox.setThemeMode('dark');
        this.setupEventListeners();
        this.setupPopStateHandler();
        
        // Wait for resources to load
        await this.waitForResources();
        
        // Initialize from URL or default to dashboard
        const initialPage = this.getPageFromUrl() || 'dashboard';
        await this.navigateTo(initialPage, false);
        
        this.state.isInitialized = true;
    }

    async waitForResources() {
        // Wait for AdminResourceLoader to be ready
        if (window.AdminResourceLoader) {
            await window.AdminResourceLoader.init();
        }
    }

    setupEventListeners() {
        this.elements.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const pageId = item.dataset.page;
                if (pageId && pageId !== this.state.currentPage) {
                    this.navigateTo(pageId, true);
                }
            });
        });
    }

    setupPopStateHandler() {
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.page) {
                this.navigateTo(event.state.page, false);
            } else {
                const pageFromUrl = this.getPageFromUrl() || 'dashboard';
                this.navigateTo(pageFromUrl, false);
            }
        });
    }

    async navigateTo(pageId, updateUrl = true) {
        if (!this.routes[pageId]) {
            console.warn(`Unknown page: ${pageId}`);
            return;
        }

        // Don't navigate if already on the same page
        if (this.state.currentPage === pageId) {
            return;
        }

        try {
            // Show loading if needed
            this.showPageTransition();

            // Hide current page
            if (this.state.currentPage) {
                this.hidePage(this.state.currentPage);
            }

            // Show new page
            await this.showPage(pageId);

            // Update navigation state
            this.updateNavigation(pageId);

            // Update URL if needed
            if (updateUrl) {
                this.updateUrl(pageId);
            }

            // Update current page
            this.state.currentPage = pageId;

            // Hide transition
            this.hidePageTransition();

        } catch (error) {
            console.error('Navigation error:', error);
            this.hidePageTransition();
        }
    }

    async showPage(pageId) {
        const pageElement = document.getElementById(this.routes[pageId]);
        if (!pageElement) {
            throw new Error(`Page element not found: ${pageId}`);
        }

        // Initialize page if not already done
        await this.initializePage(pageId);

        // Show page with animation
        pageElement.style.display = 'block';
        pageElement.classList.add('active');

        // Trigger page-specific initialization if needed
        this.triggerPageInit(pageId);
    }

    hidePage(pageId) {
        const pageElement = document.getElementById(this.routes[pageId]);
        console.log("page element", pageElement);
        if (pageElement) {
            pageElement.classList.remove('active');
            // Use timeout to allow for CSS transitions
            setTimeout(() => {
                if (!pageElement.classList.contains('active')) {
                    pageElement.style.display = 'none';
                }
            }, 200);
        }
    }

    async initializePage(pageId) {
        // Only initialize once
        if (this.state.pageInstances[pageId]) {
            return;
        }

        switch (pageId) {
            case 'dashboard':
                if (window.dashboardPage) {
                    await window.dashboardPage.init();
                    this.state.pageInstances[pageId] = window.dashboardPage;
                }
                break;
            
            case 'categories':
                if (window.categoriesPage) {
                    await window.categoriesPage.init();
                    this.state.pageInstances[pageId] = window.categoriesPage;
                }
                break;
            
            case 'users':
                if (window.usersPage) {
                    await window.usersPage.init();
                    this.state.pageInstances[pageId] = window.usersPage;
                }
                break;
            case 'editor':
                if(window.editorPage){
                    await window.editorPage.init();
                    this.state.pageInstances[pageId]=window.editorPage;
                }
                break;
        }
    }

    triggerPageInit(pageId) {
        // Trigger any additional initialization needed when page becomes visible
        switch (pageId) {
            case 'dashboard':
                if (window.dashboardPage && window.dashboardPage.onShow) {
                    window.dashboardPage.onShow();
                }
                break;
            
            case 'categories':
                if (window.categoriesPage && window.categoriesPage.onShow) {
                    window.categoriesPage.onShow();
                }
                break;
            
            case 'users':
                if (window.usersPage && window.usersPage.onShow) {
                    window.usersPage.onShow();
                }
                break;
            case 'editor':
                if(window.editorPage && window.editorPage.onShow){
                    window.editorPage.onShow()
                }
                break;
        }
    }

    updateNavigation(pageId) {
        // Remove active class from all nav items
        this.elements.navItems.forEach(item => item.classList.remove('active'));
        
        // Add active class to current page nav item
        const activeNavItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
    }

    updateUrl(pageId) {
        const newUrl = `/cic/admin/${pageId}`;
        const state = { page: pageId };
        
        history.pushState(state, '', newUrl);
        
        // Update document title
        document.title = `${this.getPageTitle(pageId)} - CIC Admin`;
    }

    getPageTitle(pageId) {
        const titles = {
            dashboard: 'Dashboard',
            categories: 'Categories',
            users: 'Users',
            editor: 'Editor'
        };
        return titles[pageId] || 'Admin';
    }

    getPageFromUrl() {
        const path = window.location.pathname;
        const segments = path.split('/');
        const lastSegment = segments[segments.length - 1];
        
        // Check if it's a valid page
        if (this.routes[lastSegment]) {
            return lastSegment;
        }
        
        return null;
    }

    showPageTransition() {
        // Add a subtle loading state if desired
        document.body.classList.add('page-transitioning');
    }

    hidePageTransition() {
        document.body.classList.remove('page-transitioning');
    }

    // Public API methods
    getCurrentPage() {
        return this.state.currentPage;
    }

    refresh() {
        if (this.state.currentPage) {
            this.triggerPageInit(this.state.currentPage);
        }
    }

    // Backward compatibility
    setActiveNavFromUrl() {
        const pageFromUrl = this.getPageFromUrl();
        if (pageFromUrl) {
            this.updateNavigation(pageFromUrl);
        }
    }
}

// CSS for smooth transitions
const transitionStyles = `
<style>
.admin-page {
    display: none;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
}

.admin-page.active {
    opacity: 1;
}

.page-transitioning .admin-page {
    pointer-events: none;
}

.nav-item {
    transition: all 0.2s ease-in-out;
}
</style>
`;

// Inject transition styles
document.head.insertAdjacentHTML('beforeend', transitionStyles);

// Initialize SPA navigation when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const spaNav = new SPANavigationManager();
    window.spaNavigation = spaNav;
    
    // Maintain backward compatibility for old navigation system
    window.navigation = {
        navigateTo: (pageId) => spaNav.navigateTo(pageId, true),
        navigateView: (viewId) => spaNav.navigateView(viewId),
        setActiveNavFromUrl: () => spaNav.setActiveNavFromUrl(),
        // Additional compatibility methods
        init: () => spaNav.init(),
        refresh: () => spaNav.refresh(),
        getCurrentPage: () => spaNav.getCurrentPage()
    };
    
    await spaNav.init();
});