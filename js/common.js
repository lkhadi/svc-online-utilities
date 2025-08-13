/**
 * Common functionality shared across all pages
 */
document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    /**
     * Show a notification
     * @param {string} message The message to display
     * @param {string} type The type of notification (success, error, info)
     */
    window.showNotification = function(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.querySelector('.notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        
        // Update notification content and style
        notification.textContent = message;
        notification.className = 'notification ' + type;
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Hide notification after delay
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
});