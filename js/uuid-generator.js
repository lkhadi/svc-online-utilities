document.addEventListener('DOMContentLoaded', function() {
    // Initialize the UUID generator
    const uuidGenerator = new UUIDv7Generator();
    
    // DOM Elements
    const uuidResult = document.getElementById('uuid-result');
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    
    // Load history from localStorage
    let uuidHistory = JSON.parse(localStorage.getItem('uuidHistory')) || [];
    updateHistoryDisplay();
    
    // Event Listeners
    generateBtn.addEventListener('click', generateUUID);
    copyBtn.addEventListener('click', copyToClipboard);
    clearHistoryBtn.addEventListener('click', clearHistory);
    
    /**
     * Generate a new UUID v7 and update the display
     */
    function generateUUID() {
        try {
            const uuid = uuidGenerator.generate();
            uuidResult.textContent = uuid;
            copyBtn.disabled = false;
            
            // Add to history
            const timestamp = new Date();
            uuidHistory.unshift({
                uuid: uuid,
                timestamp: timestamp.toISOString()
            });
            
            // Limit history size
            if (uuidHistory.length > 50) {
                uuidHistory.pop();
            }
            
            // Save to localStorage
            localStorage.setItem('uuidHistory', JSON.stringify(uuidHistory));
            
            // Update history display
            updateHistoryDisplay();
            
        } catch (error) {
            showNotification('Error generating UUID: ' + error.message, 'error');
            console.error('Error generating UUID:', error);
        }
    }
    
    /**
     * Copy the current UUID to clipboard
     */
    function copyToClipboard() {
        const uuid = uuidResult.textContent;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(uuid)
                .then(() => {
                    showNotification('UUID copied to clipboard!', 'success');
                })
                .catch(err => {
                    showNotification('Failed to copy: ' + err, 'error');
                    console.error('Failed to copy:', err);
                });
        } else {
            // Fallback for browsers without clipboard API
            const textarea = document.createElement('textarea');
            textarea.value = uuid;
            textarea.style.position = 'fixed';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    showNotification('UUID copied to clipboard!', 'success');
                } else {
                    showNotification('Failed to copy UUID', 'error');
                }
            } catch (err) {
                showNotification('Failed to copy: ' + err, 'error');
                console.error('Failed to copy:', err);
            }
            
            document.body.removeChild(textarea);
        }
    }
    
    /**
     * Update the history display with the current history array
     */
    function updateHistoryDisplay() {
        // Clear current content
        historyList.innerHTML = '';
        
        if (uuidHistory.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'empty-history';
            emptyItem.textContent = 'No UUIDs generated yet';
            historyList.appendChild(emptyItem);
            return;
        }
        
        // Add each history item
        uuidHistory.forEach((item) => {
            const listItem = document.createElement('li');
            
            // Format the timestamp
            const date = new Date(item.timestamp);
            const formattedTime = date.toLocaleString();
            
            // Create the timestamp span
            const timeSpan = document.createElement('span');
            timeSpan.className = 'timestamp';
            timeSpan.textContent = formattedTime;
            
            // Create the UUID span
            const uuidSpan = document.createElement('span');
            uuidSpan.className = 'history-uuid';
            uuidSpan.textContent = item.uuid;
            
            // Create the copy icon
            const copyIcon = document.createElement('span');
            copyIcon.className = 'copy-icon';
            copyIcon.innerHTML = '📋';
            copyIcon.title = 'Copy to clipboard';
            copyIcon.onclick = function(e) {
                e.stopPropagation();
                copyHistoryItem(item.uuid);
            };
            
            // Add everything to the list item
            listItem.appendChild(uuidSpan);
            listItem.appendChild(timeSpan);
            listItem.appendChild(copyIcon);
            
            // Add click event to the whole list item to also copy
            listItem.addEventListener('click', function() {
                copyHistoryItem(item.uuid);
            });
            
            historyList.appendChild(listItem);
        });
    }
    
    /**
     * Copy a UUID from history to clipboard
     * @param {string} uuid The UUID to copy
     */
    function copyHistoryItem(uuid) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(uuid)
                .then(() => {
                    showNotification('UUID copied to clipboard!', 'success');
                })
                .catch(err => {
                    showNotification('Failed to copy: ' + err, 'error');
                });
        } else {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = uuid;
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                document.execCommand('copy');
                showNotification('UUID copied to clipboard!', 'success');
            } catch (err) {
                showNotification('Failed to copy: ' + err, 'error');
            }
            
            document.body.removeChild(textarea);
        }
    }
    
    /**
     * Clear the UUID history
     */
    function clearHistory() {
        if (confirm('Are you sure you want to clear the history?')) {
            uuidHistory = [];
            localStorage.removeItem('uuidHistory');
            updateHistoryDisplay();
            showNotification('History cleared', 'info');
        }
    }
});