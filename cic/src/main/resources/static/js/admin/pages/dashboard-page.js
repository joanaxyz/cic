class DashboardPage {
  constructor() {
    this.pageElement = document.getElementById('dashboard');
    this.stats = null;
    this.init();
  }

  async init() {
    // Wait for AdminResourceLoader to be available
    while (!window.AdminResourceLoader) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    // Listen for stats updates
    window.AdminResourceLoader.onResourceChange('stats', (stats) => {
      this.stats = stats;
      this.updateStatsDisplay();
    });
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Initial load
    this.stats = await window.AdminResourceLoader.getStats();
    this.updateStatsDisplay();
  }

  setupEventListeners() {
    // Refresh category feedback
    const refreshCategoryFeedbackBtn = document.getElementById('refreshCategoryFeedback');
    if (refreshCategoryFeedbackBtn) {
      refreshCategoryFeedbackBtn.addEventListener('click', () => {
        this.refreshStats();
      });
    }
  }

  updateStatsDisplay() {
    if (!this.stats) return;
    
    // Update stat cards
    const elements = {
      totalCategories: document.getElementById('totalCategories'),
      totalUsers: document.getElementById('totalUsers'),
      totalChats: document.getElementById('totalChats'),
      activeUsers: document.getElementById('activeUsers'),
      inactiveUsers: document.getElementById('inactiveUsers'),
      bannedUsers: document.getElementById('bannedUsers'),
      totalMessages: document.getElementById('totalMessages'),
      mostActiveCategory: document.getElementById('mostActiveCategory'),
      avgMessagesPerUser: document.getElementById('avgMessagesPerUser'),
      registrationTrend: document.getElementById('registrationTrend'),
      systemHealth: document.getElementById('systemHealth')
    };

    // Update each element if it exists
    Object.keys(elements).forEach(key => {
      const element = elements[key];
      if (element && this.stats[key] !== undefined) {
        element.textContent = this.stats[key];
      }
    });

    // Update health indicator
    const healthIndicator = document.querySelector('.health-indicator');
    if (healthIndicator) {
      healthIndicator.className = 'health-indicator healthy';
    }

    // Update category feedback ratios
    this.updateCategoryFeedbackDisplay();
  }

  updateCategoryFeedbackDisplay() {
    const categoryFeedbackList = document.getElementById('categoryFeedbackList');
    if (!categoryFeedbackList || !this.stats || !this.stats.categoryFeedbackRatios) {
      return;
    }

    const ratios = this.stats.categoryFeedbackRatios;
    
    if (Object.keys(ratios).length === 0) {
      categoryFeedbackList.innerHTML = `
        <div class="no-feedback-data">
          <p>No feedback data available yet</p>
        </div>
      `;
      return;
    }

    let html = '';
    Object.keys(ratios).forEach(categoryName => {
      const data = ratios[categoryName];
      html += `
        <div class="category-feedback-item">
          <div class="category-feedback-header">
            <h4 class="category-name">${categoryName}</h4>
            <div class="category-stats">
              <span class="total-messages">${data.totalMessages} messages</span>
              <span class="feedback-count">${data.total} with feedback</span>
            </div>
          </div>
          <div class="feedback-ratios">
            <div class="ratio-item ratio-likes">
              <div class="ratio-bar">
                <div class="ratio-fill likes" style="width: ${data.likeRatio}%"></div>
              </div>
              <div class="ratio-details">
                <span class="ratio-icon">👍</span>
                <span class="ratio-percentage">${data.likeRatio}%</span>
                <span class="ratio-count">(${data.likes})</span>
              </div>
            </div>
            <div class="ratio-item ratio-dislikes">
              <div class="ratio-bar">
                <div class="ratio-fill dislikes" style="width: ${data.dislikeRatio}%"></div>
              </div>
              <div class="ratio-details">
                <span class="ratio-icon">👎</span>
                <span class="ratio-percentage">${data.dislikeRatio}%</span>
                <span class="ratio-count">(${data.dislikes})</span>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    categoryFeedbackList.innerHTML = html;
  }

  async refreshStats() {
    this.stats = await window.AdminResourceLoader.refresh('stats');
    this.updateStatsDisplay();
  }

  show() {
    if (this.stats) {
      this.updateStatsDisplay();
    }
  }
}

window.dashboardPage = new DashboardPage();