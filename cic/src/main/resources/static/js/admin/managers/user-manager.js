class UserManager {
    constructor() {
        this.users = [];
        this.ready = this._waitForResourceLoader();
        this.filters = {
            role: 'all',
            login: 'all',
            banned: 'all',
            search: ''
        };
    }

    async _waitForResourceLoader() {
        // Wait for AdminResourceLoader to be available
        while (!window.AdminResourceLoader) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        // Get users from centralized loader
        this.users = await window.AdminResourceLoader.getUsers();
        
        // Listen for user resource updates
        window.AdminResourceLoader.onResourceChange('users', (users) => {
            this.users = users;
        });
    }

    applyFilters(filters){
        this.filters = { ...this.filters, ...filters };
    }

    getFilteredUsers(){
        let filteredUsers = [...this.users];
        
        // Filter by role
        if (this.filters.role !== 'all') {
            filteredUsers = filteredUsers.filter(user => {
                switch(this.filters.role) {
                    case 'student':
                        return user.role === 'STUDENT';
                    case 'admin':
                        return user.role === 'ADMIN';
                    default:
                        return true;
                }
            });
        }
        
        // Filter by login status
        if (this.filters.login !== 'all') {
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            
            filteredUsers = filteredUsers.filter(user => {
                if (!user.lastLogin) {
                    return this.filters.login === 'inactive';
                }
                
                const lastLogin = new Date(user.lastLogin);
                switch(this.filters.login) {
                    case 'recent':
                        return lastLogin >= thirtyDaysAgo;
                    case 'inactive':
                        return lastLogin < thirtyDaysAgo;
                    default:
                        return true;
                }
            });
        }
        
        // Filter by banned status
        if (this.filters.banned !== 'all') {
            filteredUsers = filteredUsers.filter(user => {
                switch(this.filters.banned) {
                    case 'banned':
                        return user.banned === true;
                    case 'active':
                        return user.banned !== true;
                    default:
                        return true;
                }
            });
        }
        
        // Filter by search term (name or email)
        if (this.filters.search) {
            const searchTerm = this.filters.search.toLowerCase();
            filteredUsers = filteredUsers.filter(user => {
                return user.name.toLowerCase().includes(searchTerm) ||
                       user.email.toLowerCase().includes(searchTerm);
            });
        }
        
        return filteredUsers;
    }

    getStudents(){
        return this.users.filter(user => user.role === 'STUDENT');
    }

    getAdmins(){
        return this.users.filter(user => user.role === 'ADMIN');
    }

    getUserById(userId) {
        return this.users.find(u => u.id === userId) || null;
    }

    async promoteUser(userId) {
        const user = this.getUserById(userId);
        console.log("id: " + userId);
        try {
            const response = await window.ApiCaller.postRequest('/api/user/promote', { id: userId }, true);

            if (response.success) {
                if (user && user.role !== 'ADMIN') {
                    user.role = 'ADMIN';
                    // Update centralized resource
                    window.AdminResourceLoader.updateResource('users', this.users);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error(error);
        }
    }

    async demoteUser(userId) {
        const user = this.getUserById(userId);
        console.log("Demoting user id: " + userId);
        try {
            const response = await window.ApiCaller.postRequest('/api/user/demote', { id: userId }, true);

            if (response.success) {
                if (user && user.role === 'ADMIN') {
                    user.role = 'STUDENT';
                    // Update centralized resource
                    window.AdminResourceLoader.updateResource('users', this.users);
                    return true;
                }
            }else{
                    console.error('Failed to demote user:', response.message || response.error);
                    return false;
                }
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    async banUser(userId) {
        const user = this.getUserById(userId);
        console.log("Banning user id: " + userId);
        try {
            const response = await window.ApiCaller.postRequest('/api/user/ban', { id: userId }, true);
            if (response.success) {
                if (user) {
                    user.banned = true;
                }
                // Update centralized resource
                window.AdminResourceLoader.updateResource('users', this.users);
                return true;
            } else {
                console.error('Failed to ban user:', response.message || response.error);
                return false;
            }
        } catch (error) {
            console.error('Error banning user:', error);
            return false;
        }
    }

    async unbanUser(userId) {
        const user = this.getUserById(userId);
        console.log("Unbanning user id: " + userId);
        try {
            const response = await window.ApiCaller.postRequest('/api/user/unban', { id: userId }, true);
            if (response.success) {
                if (user) {
                    user.banned = false;
                }
                // Update centralized resource
                window.AdminResourceLoader.updateResource('users', this.users);
                return true;
            } else {
                console.error('Failed to unban user:', response.message || response.error);
                return false;
            }
        } catch (error) {
            console.error('Error unbanning user:', error);
            return false;
        }
    }

    renderUsers(tbody, onPromote, onDemote, onBan) {
        if (this.users.length === 0) {
            tbody.innerHTML = `
              <tr class="empty-row">
                <td colspan="7">
                  <div class="empty-state">No users found.</div>
                </td>
              </tr>
            `;
            return;
        }

        tbody.innerHTML = '';

        const filtereUsers = this.getFilteredUsers();

        filtereUsers.forEach(user => {
            const row = this.createUserRow(user, onPromote, onDemote, onBan);
            tbody.appendChild(row);
        });
    }

    createUserRow(user, onPromote, onDemote, onBan) {
        console.log('Creating row for user:', user);
        const tr = document.createElement('tr');
        tr.dataset.userId = user.id;
        
        // Add banned class for styling
        if (user.banned) {
            tr.classList.add('banned-user');
        }

        const fullName = `${this.escapeHtml(user.name)}`;
        const joinedDate = this.formatDate(user.joinedAt);
        const lastLogin = this.formatDateTime(user.lastLogin);
        
        console.log('Processed data:', { fullName, joinedDate, lastLogin, email: user.email, role: user.role });

        const roleClass = user.role === 'ADMIN' ? 'role-admin' : 'role-user';
        const roleName = user.role === 'ADMIN' ? 'ADMIN' : 'STUDENT';

        const banStatus = user.banned ? ' (BANNED)' : '';
        
        // Create role toggle buttons
        let roleButtons = '';
        if (user.role === 'ADMIN') {
            roleButtons = '<button class="action-btn btn-demote" data-action="demote" title="Demote to Student">Demote</button>';
        } else {
            roleButtons = '<button class="action-btn btn-promote" data-action="promote" title="Promote to Admin">Promote</button>';
        }
        
        // Create ban toggle button
        const banButton = user.banned 
            ? '<button class="action-btn btn-unban" data-action="unban" title="Unban User">Unban</button>'
            : '<button class="action-btn btn-ban" data-action="ban" title="Ban User">Ban</button>';

        tr.innerHTML = `
          <td>${fullName}${banStatus}</td>
          <td>${this.escapeHtml(user.email)}</td>
          <td><span class="user-role ${roleClass}">${roleName}</span></td>
          <td>${joinedDate}</td>
          <td>${lastLogin}</td>
          <td class="action-cell">
            <div class="action-buttons">
              ${roleButtons}
              ${banButton}
            </div>
          </td>
        `;

        // Add event listeners for action buttons
        const promoteBtn = tr.querySelector('[data-action="promote"]');
        const demoteBtn = tr.querySelector('[data-action="demote"]');
        const banBtn = tr.querySelector('[data-action="ban"]');
        const unbanBtn = tr.querySelector('[data-action="unban"]');

        if (promoteBtn) {
            promoteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                onPromote(user.id);
            });
        }

        if (demoteBtn) {
            demoteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                onDemote(user.id);
            });
        }

        if (banBtn) {
            banBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                onBan(user.id, user.name, false);
            });
        }

        if (unbanBtn) {
            unbanBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                onBan(user.id, user.name, true);
            });
        }

        return tr;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatDateTime(dateString) {
        const date = new Date(dateString);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');

        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // Convert 0 to 12

        return `${year}-${month}-${day} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    }


    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async load() {
        // Deprecated - use AdminResourceLoader instead
        try {
            this.users = await window.AdminResourceLoader.getUsers();
            console.log(this.users)
        } catch (e) {
            console.error('Error loading users:', e);
            this.users = [];
        }
    }

    getTotalCount() {
        return this.users.filter(u => !u.banned).length;
    }
}

window.userManager = new UserManager();