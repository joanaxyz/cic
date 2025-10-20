/**
 * Sidebar Toggle Functionality
 * Handles the collapsing and expanding of the admin sidebar
 * with smooth animations and glowing effects
 */
class SidebarToggle {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.glowLine = document.getElementById('sidebarGlowLine');
        this.mainContent = document.querySelector('.main-content');
        
        this.isCollapsed = false;
        this.animationDuration = 400;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSavedState();
        this.addKeyboardSupport();
    }

    setupEventListeners() {
        // Glow line click
        this.glowLine?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleSidebar();
        });

        // Enhanced glow line effects
        this.glowLine?.addEventListener('mouseenter', () => {
            this.enhanceGlow();
        });

        this.glowLine?.addEventListener('mouseleave', () => {
            this.normalizeGlow();
        });

        // Window resize handling
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    toggleSidebar() {
        if (!this.sidebar) return;

        this.isCollapsed = !this.isCollapsed;
        
        // Add transition class for smooth animation
        this.sidebar.style.transition = `all ${this.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        
        if (this.isCollapsed) {
            this.collapseSidebar();
        } else {
            this.expandSidebar();
        }

        // Save state to localStorage
        this.saveState();
        
        // Remove transition after animation
        setTimeout(() => {
            this.sidebar.style.transition = '';
        }, this.animationDuration);
    }

    collapseSidebar() {
        this.sidebar.classList.add('collapsed');
        
        // Animate main content margin
        if (this.mainContent) {
            this.mainContent.style.transition = `margin-left ${this.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            this.mainContent.style.marginLeft = '80px';
        }

        // Glow line animation
        this.animateGlowLine(true);

        // Dispatch custom event
        this.dispatchToggleEvent('collapsed');
    }

    expandSidebar() {
        this.sidebar.classList.remove('collapsed');
        
        // Animate main content margin
        if (this.mainContent) {
            this.mainContent.style.transition = `margin-left ${this.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            this.mainContent.style.marginLeft = '280px';
        }

        // Glow line animation
        this.animateGlowLine(false);

        // Dispatch custom event
        this.dispatchToggleEvent('expanded');
    }



    animateGlowLine(collapsed) {
        if (!this.glowLine) return;

        const intensity = collapsed ? 0.3 : 0.6;
        const width = collapsed ? '4px' : '6px';
        
        this.glowLine.style.transition = 'all 0.3s ease';
        this.glowLine.style.opacity = intensity;
        this.glowLine.style.width = width;
    }

    enhanceGlow() {
        if (!this.glowLine) return;
        
        this.glowLine.style.boxShadow = `
            0 0 20px rgba(74, 158, 255, 0.8),
            0 0 40px rgba(74, 158, 255, 0.5),
            0 0 60px rgba(74, 158, 255, 0.3),
            inset 0 0 10px rgba(255, 255, 255, 0.3)`;
    }

    normalizeGlow() {
        if (!this.glowLine) return;
        
        setTimeout(() => {
            if (!this.isCollapsed) {
                this.glowLine.style.boxShadow = '';
            }
        }, 300);
    }

    handleResize() {
        const isMobile = window.innerWidth < 768;
        
        if (isMobile && !this.isCollapsed) {
            this.toggleSidebar();
        } else if (!isMobile && this.isCollapsed && window.innerWidth > 1200) {
            // Auto-expand on large screens if preferred
            const autoExpand = localStorage.getItem('sidebar-auto-expand') === 'true';
            if (autoExpand) {
                this.toggleSidebar();
            }
        }
    }

    addKeyboardSupport() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + B to toggle sidebar
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                this.toggleSidebar();
            }

            // Escape key when focused on glow line
            if (e.key === 'Escape' && document.activeElement === this.glowLine) {
                this.glowLine?.blur();
            }
        });

        // Make glow line focusable and accessible
        if (this.glowLine) {
            this.glowLine.setAttribute('tabindex', '0');
            this.glowLine.setAttribute('role', 'button');
            this.glowLine.setAttribute('aria-label', 'Toggle sidebar');
            
            this.glowLine.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleSidebar();
                }
            });
        }
    }

    dispatchToggleEvent(state) {
        const event = new CustomEvent('sidebarToggle', {
            detail: { 
                state,
                isCollapsed: this.isCollapsed,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    saveState() {
        localStorage.setItem('sidebar-collapsed', this.isCollapsed);
    }

    loadSavedState() {
        const savedState = localStorage.getItem('sidebar-collapsed');
        if (savedState === 'true' && !this.isCollapsed) {
            this.toggleSidebar();
        }
    }

    // Public API methods
    collapse() {
        if (!this.isCollapsed) {
            this.toggleSidebar();
        }
    }

    expand() {
        if (this.isCollapsed) {
            this.toggleSidebar();
        }
    }

    getState() {
        return {
            isCollapsed: this.isCollapsed,
            animationDuration: this.animationDuration
        };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.sidebarToggle = new SidebarToggle();
    
    // Global accessibility improvement
    document.documentElement.style.setProperty('--sidebar-animation-duration', '400ms');
});

// Export for ES6 modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SidebarToggle;
}