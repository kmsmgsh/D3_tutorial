/**
 * UI Components Module
 * Handles reusable UI components and interactions
 */

export class UIComponents {
    constructor() {
        this.modals = new Map();
        this.notifications = [];
    }

    /**
     * Show notification message
     */
    showNotification(message, type = 'info', duration = 5000) {
        const notification = this.createNotification(message, type);
        document.body.appendChild(notification);

        // Auto-remove after duration
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);

        return notification;
    }

    /**
     * Create notification element
     */
    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add styles if not present
        this.addNotificationStyles();

        return notification;
    }

    /**
     * Get icon for notification type
     */
    getNotificationIcon(type) {
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        return icons[type] || icons.info;
    }

    /**
     * Remove notification
     */
    removeNotification(notification) {
        if (notification && notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.parentElement.removeChild(notification);
                }
            }, 300);
        }
    }

    /**
     * Add notification styles
     */
    addNotificationStyles() {
        if (document.getElementById('notification-styles')) {
            return;
        }

        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                min-width: 300px;
                animation: slideIn 0.3s ease-out;
            }

            .notification-content {
                display: flex;
                align-items: center;
                padding: 1rem;
                gap: 0.5rem;
            }

            .notification-icon {
                font-size: 1.2rem;
                flex-shrink: 0;
            }

            .notification-message {
                flex: 1;
                font-size: 0.9rem;
                color: #333;
            }

            .notification-close {
                background: none;
                border: none;
                font-size: 1.2rem;
                cursor: pointer;
                color: #999;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .notification-close:hover {
                color: #666;
            }

            .notification-success {
                border-left: 4px solid #4CAF50;
            }

            .notification-error {
                border-left: 4px solid #f44336;
            }

            .notification-warning {
                border-left: 4px solid #FF9800;
            }

            .notification-info {
                border-left: 4px solid #2196F3;
            }

            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Create modal dialog
     */
    createModal(id, title, content, options = {}) {
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="close-button">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
            </div>
        `;

        // Add event listeners
        const closeButton = modal.querySelector('.close-button');
        closeButton.addEventListener('click', () => this.hideModal(id));

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal(id);
            }
        });

        document.body.appendChild(modal);
        this.modals.set(id, modal);

        return modal;
    }

    /**
     * Show modal
     */
    showModal(id) {
        const modal = this.modals.get(id);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Hide modal
     */
    hideModal(id) {
        const modal = this.modals.get(id);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    /**
     * Create loading spinner
     */
    createLoadingSpinner(container, message = 'Loading...') {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.innerHTML = `
            <div class="spinner-circle"></div>
            <div class="spinner-message">${message}</div>
        `;

        // Add spinner styles if not present
        this.addSpinnerStyles();

        if (typeof container === 'string') {
            container = document.getElementById(container);
        }

        container.innerHTML = '';
        container.appendChild(spinner);

        return spinner;
    }

    /**
     * Add loading spinner styles
     */
    addSpinnerStyles() {
        if (document.getElementById('spinner-styles')) {
            return;
        }

        const styles = document.createElement('style');
        styles.id = 'spinner-styles';
        styles.textContent = `
            .loading-spinner {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 3rem;
                min-height: 200px;
            }

            .spinner-circle {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #2196F3;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 1rem;
            }

            .spinner-message {
                font-size: 0.9rem;
                color: #666;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Create progress bar
     */
    createProgressBar(container, progress = 0, label = '') {
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.innerHTML = `
            <div class="progress-label">${label}</div>
            <div class="progress-track">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="progress-text">${progress}%</div>
        `;

        // Add progress bar styles if not present
        this.addProgressBarStyles();

        if (typeof container === 'string') {
            container = document.getElementById(container);
        }

        container.appendChild(progressBar);

        return progressBar;
    }

    /**
     * Update progress bar
     */
    updateProgressBar(progressBar, progress, label = '') {
        const fill = progressBar.querySelector('.progress-fill');
        const text = progressBar.querySelector('.progress-text');
        const labelElement = progressBar.querySelector('.progress-label');

        if (fill) fill.style.width = `${progress}%`;
        if (text) text.textContent = `${progress}%`;
        if (labelElement && label) labelElement.textContent = label;
    }

    /**
     * Add progress bar styles
     */
    addProgressBarStyles() {
        if (document.getElementById('progress-bar-styles')) {
            return;
        }

        const styles = document.createElement('style');
        styles.id = 'progress-bar-styles';
        styles.textContent = `
            .progress-bar {
                margin: 1rem 0;
            }

            .progress-label {
                font-size: 0.9rem;
                color: #333;
                margin-bottom: 0.5rem;
            }

            .progress-track {
                background: #e0e0e0;
                border-radius: 10px;
                height: 8px;
                overflow: hidden;
                margin-bottom: 0.5rem;
            }

            .progress-fill {
                background: linear-gradient(90deg, #2196F3, #21CBF3);
                height: 100%;
                transition: width 0.3s ease;
            }

            .progress-text {
                font-size: 0.8rem;
                color: #666;
                text-align: right;
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Create tooltip
     */
    createTooltip(element, content, options = {}) {
        const tooltip = document.createElement('div');
        tooltip.className = 'ui-tooltip';
        tooltip.innerHTML = content;

        // Add tooltip styles if not present
        this.addTooltipStyles();

        const showTooltip = (e) => {
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY - 30}px`;
            document.body.appendChild(tooltip);
        };

        const hideTooltip = () => {
            if (tooltip.parentElement) {
                tooltip.parentElement.removeChild(tooltip);
            }
        };

        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
        element.addEventListener('mousemove', showTooltip);

        return { show: showTooltip, hide: hideTooltip };
    }

    /**
     * Add tooltip styles
     */
    addTooltipStyles() {
        if (document.getElementById('tooltip-styles')) {
            return;
        }

        const styles = document.createElement('style');
        styles.id = 'tooltip-styles';
        styles.textContent = `
            .ui-tooltip {
                position: absolute;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 0.5rem 0.8rem;
                border-radius: 4px;
                font-size: 0.8rem;
                pointer-events: none;
                z-index: 1001;
                white-space: nowrap;
            }

            .ui-tooltip::before {
                content: '';
                position: absolute;
                bottom: -5px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
                border-top: 5px solid rgba(0, 0, 0, 0.8);
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Create collapsible section
     */
    createCollapsible(container, title, content, expanded = false) {
        const collapsible = document.createElement('div');
        collapsible.className = 'collapsible';
        collapsible.innerHTML = `
            <div class="collapsible-header">
                <span class="collapsible-title">${title}</span>
                <span class="collapsible-icon">${expanded ? '−' : '+'}</span>
            </div>
            <div class="collapsible-content" style="display: ${expanded ? 'block' : 'none'}">
                ${content}
            </div>
        `;

        // Add click handler
        const header = collapsible.querySelector('.collapsible-header');
        const contentDiv = collapsible.querySelector('.collapsible-content');
        const icon = collapsible.querySelector('.collapsible-icon');

        header.addEventListener('click', () => {
            const isOpen = contentDiv.style.display === 'block';
            contentDiv.style.display = isOpen ? 'none' : 'block';
            icon.textContent = isOpen ? '+' : '−';
        });

        // Add collapsible styles if not present
        this.addCollapsibleStyles();

        if (typeof container === 'string') {
            container = document.getElementById(container);
        }

        container.appendChild(collapsible);

        return collapsible;
    }

    /**
     * Add collapsible styles
     */
    addCollapsibleStyles() {
        if (document.getElementById('collapsible-styles')) {
            return;
        }

        const styles = document.createElement('style');
        styles.id = 'collapsible-styles';
        styles.textContent = `
            .collapsible {
                border: 1px solid #e0e0e0;
                border-radius: 4px;
                margin-bottom: 0.5rem;
            }

            .collapsible-header {
                background: #f8f9fa;
                padding: 0.8rem 1rem;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
                user-select: none;
            }

            .collapsible-header:hover {
                background: #e9ecef;
            }

            .collapsible-title {
                font-weight: 500;
                color: #333;
            }

            .collapsible-icon {
                font-weight: bold;
                color: #666;
                font-size: 1.2rem;
            }

            .collapsible-content {
                padding: 1rem;
                border-top: 1px solid #e0e0e0;
            }
        `;

        document.head.appendChild(styles);
    }
}