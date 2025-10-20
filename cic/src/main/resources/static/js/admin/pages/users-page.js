class UsersPage {
    constructor() {
        this.USERS_PER_PAGE = 10;
        this.currentPage = 1;
        this.filteredUsers = [];
        this.pageElement = document.getElementById('users-page');
        this.elements = {
            page: this.pageElement,
            tableBody: document.getElementById('usersTableBody')
        };
        this.filterComponent = null;
        this.paginationComponent = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        // Wait for dependencies
        while (!window.userManager || !window.FilterComponent || !window.PaginationComponent) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        // Wait for user manager to be ready
        if (window.userManager.ready) {
            await window.userManager.ready;
        }

        // Initialize Filter Component
        this.filterComponent = new FilterComponent({
            toggleBtn: document.getElementById('filterToggleBtn'),
            panel: document.getElementById('filterPanel'),
            options: document.querySelectorAll('.filter-option'),
            searchInput: document.getElementById('searchInput'),
            clearBtn: document.getElementById('clearFiltersBtn'),
            onFilterChange: (filters) => {
                window.userManager.applyFilters(filters);
                this.filteredUsers = window.userManager.getFilteredUsers();
                this.currentPage = 1;
                this.render();
            }
        });

        // Initialize Pagination Component
        this.paginationComponent = new PaginationComponent({
            container: document.getElementById('paginationContainer'),
            info: document.getElementById('paginationInfo'),
            numbers: document.getElementById('paginationNumbers'),
            firstBtn: document.getElementById('firstPageBtn'),
            prevBtn: document.getElementById('prevPageBtn'),
            nextBtn: document.getElementById('nextPageBtn'),
            lastBtn: document.getElementById('lastPageBtn'),
            itemsPerPage: this.USERS_PER_PAGE,
            onPageChange: (page) => {
                this.currentPage = page;
                this.render();
            }
        });

        this.filteredUsers = window.userManager.getFilteredUsers();
        this.render();
        this.isInitialized = true;
    }

    // User action handlers using the user manager
    async handlePromoteUser(userId) {
        const user = window.userManager.getUserById(userId);
        if (!user) return;

        window.MessageBox.showConfirm(`Are you sure you want to promote ${user.name} to Admin?`, async () => {
            const success = await window.userManager.promoteUser(userId);
            if (success) {
                this.render();
            }
        });
    }

    async handleDemoteUser(userId) {
        const user = window.userManager.getUserById(userId);
        if (!user) return;
        
        window.MessageBox.showConfirm(`Are you sure you want to demote ${user.name} to Student?`, async () => {
            const success = await window.userManager.demoteUser(userId);
            if (success) {
                this.render();
            } else {
                console.error('Failed to demote user');
                window.MessageBox.showError('Failed to demote user. Please try again.');
            }
        });
    }

    async handleBanUser(userId, name, isBanned) {
        const actionText = isBanned ? 'unban' : 'ban';
        window.MessageBox.showConfirm(`Are you sure you want to ${actionText} this user? ${name}`, async () => {
            let success = false;
            if (isBanned) {
                success = await window.userManager.unbanUser(userId);
            } else {
                success = await window.userManager.banUser(userId);
            }
            
            if (success) {
                this.render();
            } else {
                console.error(`Failed to ${actionText} user`);
                window.MessageBox.showError(`Failed to ${actionText} user. Please try again.`);
            }
        });
    }

    getPaginatedUsers() {
        return this.paginationComponent.getPaginatedItems(this.filteredUsers);
    }

    render() {
        if (!this.elements.tableBody) return;

        const paginatedUsers = this.getPaginatedUsers();
        
        // Create a temporary UserManager instance with paginated users
        const tempManager = Object.create(window.userManager);
        tempManager.users = paginatedUsers;

        tempManager.renderUsers(
            this.elements.tableBody,
            (userId) => this.handlePromoteUser(userId),
            (userId) => this.handleDemoteUser(userId),
            (userId, name, isBanned) => this.handleBanUser(userId, name, isBanned)
        );

        // Update pagination
        this.paginationComponent.update(this.filteredUsers.length);
    }

    onShow() {
        this.render();
    }

    show() {
        this.render();
    }
}

window.usersPage = new UsersPage();