document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        userProfile: document.getElementById('userProfile'),
        profileDropdown: document.getElementById('profileDropdown'),
        logoutBtn: document.getElementById('logoutBtn'),
        adminBtn: document.getElementById('adminBtn'),
        userRoleBadge: document.getElementById('userRoleBadge'),
        username: document.getElementById('username'),
        role: document.getElementById('userRoleBadge')
    };

    const setupEventListeners = () => {

        elements.userProfile.addEventListener('click', (e) => {
            e.stopPropagation();
            elements.profileDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!elements.profileDropdown.contains(e.target) && 
                !elements.userProfile.contains(e.target)) {
                elements.profileDropdown.classList.remove('active');
            }
        });

        elements.profileDropdown.addEventListener('click', (e) => e.stopPropagation());

        elements.logoutBtn.addEventListener('click', handleLogout);
        elements.adminBtn.addEventListener('click', handleAdminRedirect);
    };

    const initUser = () => {
        const user = window.ApiCaller.auth.user;
        elements.username.textContent = user.name;
        const role = user.role;
        if(role == 'STUDENT'){
            elements.role.classList.remove('admin');
            elements.role.classList.add('student');
            elements.role.textContent = 'STUDENT';
            elements.adminBtn.style.display = 'none'; // Hide admin button for students
        }else{
            elements.role.classList.remove('student');
            elements.role.classList.add('admin');
            elements.role.textContent = 'ADMIN';
            elements.adminBtn.style.display = 'flex'; // Show admin button for admins
        }
        
    }

    const handleLogout = () => {
        window.MessageBox.showConfirm('Are you sure you want to logout?', () => {
            window.ApiCaller.auth.signOut(() => window.MessageBox.hide());
        });
    };

    const handleAdminRedirect = () => {
        window.location.href = '/cic/admin/dashboard';
    };

    setupEventListeners();
    initUser();
});
