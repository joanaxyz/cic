/**
 * AdminResourceLoader - Centralized async resource loading for admin pages
 * Reduces redundant API calls and coordinates loading of all admin resources
 */
class AdminResourceLoader {
    constructor() {
        this.resources = {
            users: null,
            categories: null,
            chats: null,
            messages: null,
            sessions: null,
            stats: null
        };
        
        this.loadingPromises = {
            users: null,
            categories: null,
            chats: null,
            sessions: null,
            stats: null
        };
        
        this.isInitialized = false;
        this.initPromise = null;
        
        // Resource change listeners
        this.listeners = {
            users: [],
            categories: [],
            chats: null,
            sessions:[],
            stats: []
        };
    }

    /**
     * Initialize all admin resources in parallel
     * @returns {Promise<void>}
     */
    async init() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = this._loadAllResources();
        await this.initPromise;
        this.isInitialized = true;
        return this.initPromise;
    }

    /**
     * Load all resources in parallel
     * @private
     */
    async _loadAllResources() {
        const loadPromises = [
            this.loadUsers(),
            this.loadCategories(),
            this.loadChats(),
            this.loadSessions(),
            this.loadStats()
        ];

        try {
            await Promise.allSettled(loadPromises);
        } catch (error) {
            console.error('Error loading admin resources:', error);
        }
    }

    /**
     * Load users data
     * @returns {Promise<Array>}
     */
    async loadUsers() {
        if (this.loadingPromises.users) {
            return this.loadingPromises.users;
        }

        this.loadingPromises.users = this._fetchUsers();
        
        try {
            this.resources.users = await this.loadingPromises.users;
            this._notifyListeners('users', this.resources.users);
            return this.resources.users;
        } catch (error) {
            console.error('Error loading users:', error);
            this.resources.users = [];
            return [];
        } finally {
            this.loadingPromises.users = null;
        }
    }

    /**
     * Load categories data
     * @returns {Promise<Array>}
     */
    async loadCategories() {
        if (this.loadingPromises.categories) {
            return this.loadingPromises.categories;
        }

        this.loadingPromises.categories = this._fetchCategories();
        
        try {
            this.resources.categories = await this.loadingPromises.categories;
            this._notifyListeners('categories', this.resources.categories);
            return this.resources.categories;
        } catch (error) {
            console.error('Error loading categories:', error);
            this.resources.categories = [];
            return [];
        } finally {
            this.loadingPromises.categories = null;
        }
    }

    async loadChats(){
        if(this.loadingPromises.chats){
            return this.loadingPromises.chats;
        }

        this.loadingPromises.chats = this._fetchChats();
        try{
            this.resources.chats = await this.loadingPromises.chats;
            this.resources.messages = this.resources.chats.flatMap(chat =>
                chat.messages.map(message => ({...message}))
            );
            this._notifyListeners('chats', this.resources.chats);
            return this.resources.chats;
        }catch(error){
            console.error('Error loading chats:', error);
        }finally {
            this.loadingPromises.chats = null;
        }
    }

    async loadSessions() {
        if(this.loadingPromises.sessions){
            return this.loadingPromises.sessions;
        }
        this.loadingPromises.sessions = this._fetchSessions();

        try{
            this.resources.sessions = await this.loadingPromises.sessions;
            this._notifyListeners('sessions', this.resources.sessions);
            return this.resources.sessions;
        }catch(error){
            console.error('Error loading sessions:', error);
            this.resources.sessions = [];
            return [];
        }finally{
            this.loadingPromises.sessions = null;
        }
    }

    /**
     * Load dashboard statistics
     * @returns {Promise<Object>}
     */
    async loadStats() {
        if (this.loadingPromises.stats) {
            return this.loadingPromises.stats;
        }

        this.loadingPromises.stats = this._fetchStats();
        
        try {
            this.resources.stats = await this.loadingPromises.stats;
            this._notifyListeners('stats', this.resources.stats);
            return this.resources.stats;
        } catch (error) {
            console.error('Error loading stats:', error);
            this.resources.stats = {};
            return {};
        } finally {
            this.loadingPromises.stats = null;
        }
    }

    /**
     * Fetch users from API
     * @private
     */
    async _fetchUsers() {
        const response = await window.ApiCaller.getRequest('/api/user/getAll', true);
        if (response.success) {
            return response.data || [];
        }
        throw new Error(response.message || 'Failed to load users');
    }

    /**
     * Fetch categories from API
     * @private
     */
    async _fetchCategories() {
        const response = await window.ApiCaller.getRequest('/api/category/getAll', true);
        if (response.success) {
            return response.data || [];
        }
        throw new Error(response.message || 'Failed to load categories');
    }

    async _fetchChats(){
        const response = await window.ApiCaller.getRequest('/api/chat/getAll', true);
        if(response.success){
            return response.data || [];
        }
        throw new Error(response.message || 'Failed to load chats');
    }

    async _fetchSessions(){
        const response = await window.ApiCaller.getRequest('/api/session/getAll', true);
        if(response.success){
            return response.data || [];
        }
        throw new Error(response.message || 'Failed to load sessions');
    }

    /**
     * Fetch dashboard statistics from API
     * @private
     */
    async _fetchStats() {
        try {
            // Load stats data in parallel if endpoints exist
            const promises = [];
            
            // You can add specific stats endpoints here when they're available
            // For now, we'll calculate from loaded data
            await Promise.all([this.loadUsers(), this.loadCategories(), this.loadChats(), this.loadSessions()]);
            
            const users = this.resources.users || [];
            const categories = this.resources.categories || [];
            const sessions = this.resources.sessions || [];
            const chats = this.resources.chats || [];
            const messages = this.resources.messages || [];
            console.log("sessions in loader: " , sessions);
            console.log("categories in loader: ", categories)
            return {
                totalUsers: users.filter(u => !u.banned).length,
                totalCategories: categories.length,
                totalChats: chats.length,
                activeUsers: sessions.filter(s=> s.active === true).length,
                inactiveUsers: sessions.filter(s=> s.active === false).length,
                bannedUsers: users.filter(u => u.banned).length,
                totalMessages: messages.length,
                mostActiveCategory: this._getMostActiveCategory(messages),
                avgMessagesPerUser: this._calculateAvgMessages(chats),
                registrationTrend: this._calculateRegistrationTrend(users),
                systemHealth: 'Operational',
                categoryFeedbackRatios: this._calculateCategoryFeedbackRatios(messages, categories)
            };
        } catch (error) {
            console.error('Error calculating stats:', error);
            return {};
        }
    }

    /**
     * Get most active category
     * @private
     */
    _getMostActiveCategory(messages) {
        if(!messages || messages.length===0)return null;
        const messagessPerCategory = messages.reduce((acc, message) => {
            acc[message.category] = (acc[message.category] || 0) + 1;
                return acc;
        }, {});
        let mostactivecat = null;
        let maxCount = 0;

        for(const [category, count] of Object.entries(messagessPerCategory)){
            if  (count > maxCount){
                maxCount = count;
                mostactivecat = category;
            }
        }
        return mostactivecat;
    }

    /**
     * Calculate average messages per user
     * @private
     */
   _calculateAvgMessages(chats) {
        if (!chats || chats.length === 0) return 0;

        const chatsPerUser = chats.reduce((acc, chat) => {
            acc[chat.userId] = (acc[chat.userId] || 0) + 1;
            return acc;
        }, {});

        const totalUsers = Object.keys(chatsPerUser).length;
        return chats.length / totalUsers;
    }


    /**
     * Calculate registration trend
     * @private
     */
    _calculateRegistrationTrend(users) {
        if (!users || users.length === 0) return '+0% this month';
        
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        
        const recentRegistrations = users.filter(u => 
            u.joinedAt && new Date(u.joinedAt) >= lastMonth
        ).length;
        
        const trend = Math.floor((recentRegistrations / users.length) * 100);
        return `+${trend}% this month`;
    }

    /**
     * Calculate like/dislike ratios per category
     * @private
     */
    _calculateCategoryFeedbackRatios(messages, categories) {
        if (!messages || messages.length === 0 || !categories || categories.length === 0) {
            return {};
        }

        const categoryRatios = {};
        
        categories.forEach(category => {
            const categoryMessages = messages.filter(m => m.category === category.name);
            
            if (categoryMessages.length > 0) {
                const likes = categoryMessages.filter(m => m.like === true).length;
                const dislikes = categoryMessages.filter(m => m.like === false).length;
                const total = likes + dislikes;
                
                if (total > 0) {
                    const likeRatio = Math.round((likes / total) * 100);
                    const dislikeRatio = Math.round((dislikes / total) * 100);
                    
                    categoryRatios[category.name] = {
                        likes: likes,
                        dislikes: dislikes,
                        total: total,
                        likeRatio: likeRatio,
                        dislikeRatio: dislikeRatio,
                        totalMessages: categoryMessages.length
                    };
                } else {
                    // No feedback provided yet
                    categoryRatios[category.name] = {
                        likes: 0,
                        dislikes: 0,
                        total: 0,
                        likeRatio: 0,
                        dislikeRatio: 0,
                        totalMessages: categoryMessages.length
                    };
                }
            }
        });

        return categoryRatios;
    }

    /**
     * Get users data (cached or load)
     * @returns {Promise<Array>}
     */
    async getUsers() {
        if (this.resources.users) {
            return this.resources.users;
        }
        return await this.loadUsers();
    }

    /**
     * Get categories data (cached or load)
     * @returns {Promise<Array>}
     */
    async getCategories() {
        if (this.resources.categories) {
            return this.resources.categories;
        }
        return await this.loadCategories();
    }

    async getChats(){
        if(this.resources.chats){
            return this.resources.chats;
        }
        return await this.loadChats();
    }

    async getSessions(){
        if(this.resources.sessions){
            return this.resources.sessions;
        }
        return await this.loadSessions();
    }

    /**
     * Get stats data (cached or load)
     * @returns {Promise<Object>}
     */
    async getStats() {
        if (this.resources.stats) {
            return this.resources.stats;
        }
        return await this.loadStats();
    }

    /**
     * Refresh specific resource
     * @param {string} resourceType - 'users', 'categories', or 'stats'
     * @returns {Promise<*>}
     */
    async refresh(resourceType) {
        switch (resourceType) {
            case 'users':
                this.resources.users = null;
                return await this.loadUsers();
            case 'categories':
                this.resources.categories = null;
                return await this.loadCategories();
            case 'chats':
                this.resources.chats = null;
                return await this.loadChats();
            case 'messages':
                this.resources.messages = null;
                return await this.loadChats();
            case 'sessions':
                this.resources.sessions = null;
                return await this.loadSessions();
            case 'stats':
                this.resources.stats = null;
                return await this.loadStats();
            default:
                throw new Error(`Unknown resource type: ${resourceType}`);
        }
    }

    /**
     * Refresh all resources
     * @returns {Promise<void>}
     */
    async refreshAll() {
        this.resources.users = null;
        this.resources.categories = null;
        this.resources.chats = null;
        this.resources.messages = null;
        this.resources.sessions = null;
        this.resources.stats = null;
        this.initPromise = null;
        this.isInitialized = false;
        
        await this.init();
    }

    /**
     * Add listener for resource changes
     * @param {string} resourceType
     * @param {Function} callback
     */
    onResourceChange(resourceType, callback) {
        if (this.listeners[resourceType]) {
            this.listeners[resourceType].push(callback);
        }
    }

    /**
     * Remove listener for resource changes
     * @param {string} resourceType
     * @param {Function} callback
     */
    offResourceChange(resourceType, callback) {
        if (this.listeners[resourceType]) {
            const index = this.listeners[resourceType].indexOf(callback);
            if (index > -1) {
                this.listeners[resourceType].splice(index, 1);
            }
        }
    }

    /**
     * Notify listeners of resource changes
     * @private
     */
    _notifyListeners(resourceType, data) {
        if (this.listeners[resourceType]) {
            this.listeners[resourceType].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${resourceType} listener:`, error);
                }
            });
        }
    }

    /**
     * Update resource data (for optimistic updates)
     * @param {string} resourceType
     * @param {*} data
     */
    updateResource(resourceType, data) {
        if (this.resources.hasOwnProperty(resourceType)) {
            this.resources[resourceType] = data;
            this._notifyListeners(resourceType, data);
        }
    }

    /**
     * Get loading state for specific resource
     * @param {string} resourceType
     * @returns {boolean}
     */
    isLoading(resourceType) {
        return !!this.loadingPromises[resourceType];
    }

    /**
     * Check if all resources are loaded
     * @returns {boolean}
     */
    areAllResourcesLoaded() {
        return this.isInitialized && 
               this.resources.users !== null && 
               this.resources.categories !== null && 
               this.resources.chats !== null &&
               this.resources.messages !== null &&
               this.resources.sessions !== null &&
               this.resources.stats !== null;
    }
}

// Initialize global instance
window.AdminResourceLoader = new AdminResourceLoader();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.AdminResourceLoader.init().catch(error => {
        console.error('Failed to initialize admin resources:', error);
    });
});