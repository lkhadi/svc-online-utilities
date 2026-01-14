document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('video-url');
    const getBtn = document.getElementById('get-thumbs-btn');
    const resultsSection = document.getElementById('results-section');

    // Thumbnail Elements
    const thumbMaxRes = document.getElementById('thumb-maxres');
    const linkMaxRes = document.getElementById('link-maxres');
    
    const thumbSd = document.getElementById('thumb-sd');
    const linkSd = document.getElementById('link-sd');
    
    const thumbHq = document.getElementById('thumb-hq');
    const linkHq = document.getElementById('link-hq');
    
    const thumbMq = document.getElementById('thumb-mq');
    const linkMq = document.getElementById('link-mq');

    // Extract Video ID logic
    function getVideoId(url) {
        if (!url) return null;
        
        // RegEx for various YouTube URL formats
        // Supports: 
        // - youtube.com/watch?v=ID
        // - youtu.be/ID
        // - youtube.com/embed/ID
        // - youtube.com/v/ID
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    function updateThumbnails() {
        const url = urlInput.value.trim();
        const videoId = getVideoId(url);

        if (!videoId) {
            window.showNotification("Invalid YouTube URL. Please check and try again.", "error");
            return;
        }

        // Construct standard YouTube thumbnail URLs
        const maxResUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        const sdUrl = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
        const hqUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        const mqUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

        // Update Images
        thumbMaxRes.src = maxResUrl;
        thumbSd.src = sdUrl;
        thumbHq.src = hqUrl;
        thumbMq.src = mqUrl;

        // Update Links
        linkMaxRes.href = maxResUrl;
        linkSd.href = sdUrl;
        linkHq.href = hqUrl;
        linkMq.href = mqUrl;

        // Show Results
        resultsSection.classList.remove('hidden');
        window.showNotification("Thumbnails extracted successfully!", "success");
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Event Listeners
    getBtn.addEventListener('click', updateThumbnails);
    
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            updateThumbnails();
        }
    });

    // Copy URL Buttons
    document.querySelectorAll('.copy-url-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetLink = document.getElementById(targetId);
            
            if (targetLink && targetLink.href && targetLink.href !== '#') {
                navigator.clipboard.writeText(targetLink.href).then(() => {
                    const originalText = this.textContent;
                    this.textContent = "Copied!";
                    setTimeout(() => {
                        this.textContent = originalText;
                    }, 2000);
                    window.showNotification("Thumbnail URL copied to clipboard", "success");
                }).catch(err => {
                    console.error('Failed to copy', err);
                    window.showNotification("Failed to copy URL", "error");
                });
            }
        });
    });
});
