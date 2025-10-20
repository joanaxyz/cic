class AdminModal {
    constructor(modalId) {
        this.modal = document.getElementById(modalId) || this.createModal(modalId);
        this.overlay = this.modal.querySelector('.modal-overlay');
        this.container = this.modal.querySelector('.modal-container');
        this.closeBtn = this.modal.querySelector('.modal-close');
        this.cancelBtn = this.modal.querySelector('.btn-cancel');
        
        this.setupEventListeners();
    }

    createModal(modalId) {
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-container">
                    <button class="modal-close">&times;</button>
                    <div class="modal-header">
                        <h2 class="modal-title">Modal Title</h2>
                    </div>
                    <div class="modal-body">
                        <p>Modal content goes here.</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary btn-cancel">Cancel</button>
                        <button class="btn btn-primary btn-confirm">Confirm</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    setupEventListeners() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.hide());
        }
        
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => this.hide());
        }
        
        if (this.overlay) {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.hide();
                }
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible()) {
                this.hide();
            }
        });
    }

    show() {
        this.modal.style.display = 'flex';
        setTimeout(() => {
            this.modal.classList.add('show');
        }, 10);
    }

    hide() {
        this.modal.classList.remove('show');
        setTimeout(() => {
            this.modal.style.display = 'none';
        }, 300);
    }

    isVisible() {
        return this.modal.classList.contains('show');
    }

    setTitle(title) {
        const titleEl = this.modal.querySelector('.modal-title');
        if (titleEl) titleEl.textContent = title;
    }

    setBody(content) {
        const bodyEl = this.modal.querySelector('.modal-body');
        if (bodyEl) {
            if (typeof content === 'string') {
                bodyEl.innerHTML = content;
            } else {
                bodyEl.innerHTML = '';
                bodyEl.appendChild(content);
            }
        }
    }

    setFooter(content) {
        const footerEl = this.modal.querySelector('.modal-footer');
        if (footerEl) {
            if (typeof content === 'string') {
                footerEl.innerHTML = content;
            } else {
                footerEl.innerHTML = '';
                footerEl.appendChild(content);
            }
        }
    }
}

window.AdminModal = AdminModal;