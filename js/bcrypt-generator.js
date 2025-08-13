document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const passwordInput = document.getElementById('password-input');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const saltRoundsInput = document.getElementById('salt-rounds');
    const saltValueDisplay = document.getElementById('salt-value');
    const generateBtn = document.getElementById('generate-btn');
    const hashResult = document.getElementById('hash-result');
    const copyHashBtn = document.getElementById('copy-hash-btn');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    
    // Load history from localStorage
    let hashHistory = JSON.parse(localStorage.getItem('bcryptHistory')) || [];
    updateHistoryDisplay();
    
    // Event Listeners
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    saltRoundsInput.addEventListener('input', updateSaltValue);
    generateBtn.addEventListener('click', generateHash);
    copyHashBtn.addEventListener('click', copyToClipboard);
    clearHistoryBtn.addEventListener('click', clearHistory);
    
    /**
     * Toggle password visibility
     */
    function togglePasswordVisibility() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            togglePasswordBtn.textContent = 'Hide';
        } else {
            passwordInput.type = 'password';
            togglePasswordBtn.textContent = 'Show';
        }
    }
    
    /**
     * Update salt rounds value display
     */
    function updateSaltValue() {
        saltValueDisplay.textContent = saltRoundsInput.value;
    }
    
    /**
     * Generate bcrypt hash
     */
    function generateHash() {
        const password = passwordInput.value.trim();
        if (!password) {
            showNotification('Please enter a password', 'error');
            return;
        }
        
        const rounds = parseInt(saltRoundsInput.value);
        hashResult.textContent = 'Generating hash...';
        
        // Show loading state
        generateBtn.disabled = true;
        
        // Use setTimeout to allow UI to update before intensive computation
        setTimeout(function() {
            try {
                // Generate bcrypt hash using the browser-compatible library
                const hash = dcodeIO.bcrypt.hashSync(password, rounds);
                
                // Display the hash
                hashResult.textContent = hash;
                copyHashBtn.disabled = false;
                generateBtn.disabled = false;
                
                // Add to history
                const timestamp = new Date();
                hashHistory.unshift({
                    password: maskPassword(password),
                    hash: hash,
                    rounds: rounds,
                    timestamp: timestamp.toISOString()
                });
                
                // Limit history size
                if (hashHistory.length > 50) {
                    hashHistory.pop();
                }
                
                // Save to localStorage
                localStorage.setItem('bcryptHistory', JSON.stringify(hashHistory));
                
                // Update history display
                updateHistoryDisplay();
                
                showNotification('Hash generated successfully!', 'success');
            } catch (error) {
                hashResult.textContent = 'Error generating hash';
                showNotification('Error: ' + error.message, 'error');
                console.error('Error generating hash:', error);
                generateBtn.disabled = false;
            }
        }, 100);
    }
    
    /**
     * Mask a password for display in history
     * @param {string} password The password to mask
     * @returns {string} The masked password
     */
    function maskPassword(password) {
        if (password.length <= 2) {
            return '*'.repeat(password.length);
        }
        return password.substring(0, 1) + '*'.repeat(password.length - 2) + password.substring(password.length - 1);
    }
    
    /**
     * Copy the current hash to clipboard
     */
    function copyToClipboard() {
        const hash = hashResult.textContent;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(hash)
                .then(() => {
                    showNotification('Hash copied to clipboard!', 'success');
                })
                .catch(err => {
                    showNotification('Failed to copy: ' + err, 'error');
                    console.error('Failed to copy:', err);
                });
        } else {
            // Fallback for browsers without clipboard API
            const textarea = document.createElement('textarea');
            textarea.value = hash;
            textarea.style.position = 'fixed';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    showNotification('Hash copied to clipboard!', 'success');
                } else {
                    showNotification('Failed to copy hash', 'error');
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
        
        if (hashHistory.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'empty-history';
            emptyItem.textContent = 'No hashes generated yet';
            historyList.appendChild(emptyItem);
            return;
        }
        
        // Add each history item
        hashHistory.forEach((item) => {
            const listItem = document.createElement('li');
            
            // Create history item container
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            // Add password (masked)
            const passwordElem = document.createElement('span');
            passwordElem.className = 'password';
            passwordElem.textContent = `Password: ${item.password} (rounds: ${item.rounds})`;
            historyItem.appendChild(passwordElem);
            
            // Add hash
            const hashElem = document.createElement('span');
            hashElem.className = 'hash';
            hashElem.textContent = item.hash;
            historyItem.appendChild(hashElem);
            
            // Create the copy icon
            const copyIcon = document.createElement('span');
            copyIcon.className = 'copy-icon';
            copyIcon.innerHTML = '📋';
            copyIcon.title = 'Copy to clipboard';
            copyIcon.onclick = function(e) {
                e.stopPropagation();
                copyHistoryItem(item.hash);
            };
            
            // Add everything to the list item
            listItem.appendChild(historyItem);
            listItem.appendChild(copyIcon);
            
            // Add click event to the hash span to copy
            hashElem.addEventListener('click', function() {
                copyHistoryItem(item.hash);
            });
            
            historyList.appendChild(listItem);
        });
    }
    
    /**
     * Copy a hash from history to clipboard
     * @param {string} hash The hash to copy
     */
    function copyHistoryItem(hash) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(hash)
                .then(() => {
                    showNotification('Hash copied to clipboard!', 'success');
                })
                .catch(err => {
                    showNotification('Failed to copy: ' + err, 'error');
                });
        } else {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = hash;
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                document.execCommand('copy');
                showNotification('Hash copied to clipboard!', 'success');
            } catch (err) {
                showNotification('Failed to copy: ' + err, 'error');
            }
            
            document.body.removeChild(textarea);
        }
    }
    
    /**
     * Clear the hash history
     */
    function clearHistory() {
        if (confirm('Are you sure you want to clear the history?')) {
            hashHistory = [];
            localStorage.removeItem('bcryptHistory');
            updateHistoryDisplay();
            showNotification('History cleared', 'info');
        }
    }
});