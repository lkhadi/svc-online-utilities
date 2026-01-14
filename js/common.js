/**
 * Common functionality shared across all pages
 */
document.addEventListener('DOMContentLoaded', function() {
    // Current Year in Footer
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Sidebar Toggle Logic
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.overlay');

    function toggleSidebar() {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('show');
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }

    // Close sidebar when clicking overlay
    if (overlay) {
        overlay.addEventListener('click', toggleSidebar);
    }

    // Active Link Highlighting
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath) {
            link.classList.add('active');
        }
    });

    /**
     * Show a notification
     * @param {string} message The message to display
     * @param {string} type The type of notification (success, error, info)
     */
    window.showNotification = function(message, type = 'info') {
        let notification = document.querySelector('.notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        
        notification.textContent = message;
        notification.className = 'notification ' + type;
        
        // Use slight delay to allow transition
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
});