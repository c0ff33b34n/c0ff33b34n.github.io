document.addEventListener('DOMContentLoaded', function () {
    const urlInput = document.getElementById('url');
    const submitButton = document.getElementById('submit-test');
    const iframe = document.getElementById('iframe');

    function isValidUrl(url) {
        try {
            const parsedUrl = new URL(url);
            return ['http:', 'https:'].includes(parsedUrl.protocol);
        } catch (e) {
            return false;
        }
    }

    function ensureHttps(url) {
        if (url.startsWith('http://')) {
            return url.replace('http://', 'https://');
        }
        if (!url.startsWith('https://')) {
            return 'https://' + url;
        }
        return url;
    }

    function showError(message, isVulnerable = false) {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        
        // Create checkmark/warning icon
        const icon = document.createElement('span');
        icon.className = 'status-icon';
        icon.textContent = isVulnerable ? '⚠️' : '✅';
        
        // Create message text
        const messageText = document.createElement('span');
        messageText.textContent = message;
        
        errorDiv.appendChild(icon);
        errorDiv.appendChild(messageText);
        
        urlInput.parentNode.insertBefore(errorDiv, submitButton.nextSibling);
    }

    function checkFrameability() {
        return new Promise((resolve) => {
            // Set a timeout in case the load event doesn't fire
            const timeoutId = setTimeout(() => {
                resolve(true); // If timeout occurs, site might be vulnerable
            }, 5000);

            // Listen for load event
            iframe.onload = function() {
                clearTimeout(timeoutId);
                try {
                    // First check if we can access the frame at all
                    if (iframe.contentWindow) {
                        // Try to access location - this will throw if X-Frame-Options is set
                        const frameLocation = iframe.contentWindow.location.href;
                        // If we get here, the page loaded in the frame
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                } catch (e) {
                    // If we can't access the frame, it's protected
                    resolve(false);
                }
            };

            // Listen for error event
            iframe.onerror = function() {
                clearTimeout(timeoutId);
                resolve(false);
            };
        });
    }

    async function frameIt() {
        let url = urlInput.value.trim();
        
        // Reset iframe
        iframe.src = 'about:blank';

        // Validate URL
        if (!url) {
            showError('Please enter a URL');
            return;
        }

        // Add https:// if no protocol specified
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
            urlInput.value = url;
        }

        if (!isValidUrl(url)) {
            showError('Please enter a valid URL (e.g., https://example.com)');
            return;
        }

        // Ensure HTTPS
        url = ensureHttps(url);
        urlInput.value = url;

        // Update button state
        submitButton.disabled = true;
        submitButton.style.opacity = '0.7';
        submitButton.textContent = 'Testing...';

        try {
            // Load the URL in the iframe
            iframe.src = url;
            
            // Check if the page can be framed
            const isVulnerable = await checkFrameability();
            
            if (isVulnerable) {
                showError('This site might be vulnerable to clickjacking! The page can be embedded in an iframe.', true);
            } else {
                showError('This site is protected against clickjacking');
            }
        } catch (e) {
            showError('Error testing the URL');
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
            submitButton.textContent = 'Test URL';
        }
    }

    // Event listeners
    submitButton.addEventListener('click', frameIt);
    
    // Allow Enter key to submit
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            frameIt();
        }
    });

    // Auto-select URL on focus
    urlInput.addEventListener('focus', function() {
        this.select();
    });
});
