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

    function showMessage(message, type = 'info') {
        const existingMessage = document.querySelector('.error-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = 'error-message';
        
        // Create message text
        const messageText = document.createElement('span');
        messageText.textContent = message;
        messageDiv.appendChild(messageText);
        
        urlInput.parentNode.insertBefore(messageDiv, submitButton.nextSibling);
    }

    function checkFrameability() {
        return new Promise((resolve) => {
            let isLoaded = false;
            
            // Set a timeout for the overall check
            const timeoutId = setTimeout(() => {
                if (!isLoaded) {
                    resolve('timeout');
                }
            }, 10000);

            // Listen for load event
            iframe.onload = function() {
                isLoaded = true;
                clearTimeout(timeoutId);
                
                try {
                    // If we can access the frame content, it's vulnerable
                    if (iframe.contentDocument || iframe.contentWindow) {
                        resolve('vulnerable');
                    } else {
                        resolve('protected');
                    }
                } catch (e) {
                    // If we get a security error, the frame is protected
                    resolve('protected');
                }
            };

            // Listen for error event
            iframe.onerror = function() {
                isLoaded = true;
                clearTimeout(timeoutId);
                resolve('error');
            };
        });
    }

    async function frameIt() {
        let url = urlInput.value.trim();
        
        // Reset iframe
        iframe.src = 'about:blank';

        // Validate URL
        if (!url) {
            showMessage('Please enter a URL');
            return;
        }

        // Add https:// if no protocol specified
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
            urlInput.value = url;
        }

        if (!isValidUrl(url)) {
            showMessage('Please enter a valid URL (e.g., https://example.com)');
            return;
        }

        // Ensure HTTPS
        url = ensureHttps(url);
        urlInput.value = url;

        // Update button state
        submitButton.disabled = true;
        submitButton.style.opacity = '0.7';
        submitButton.textContent = 'Testing...';
        showMessage('Testing for clickjacking vulnerability...');

        try {
            // Load the URL in the iframe
            iframe.src = url;
            
            // Check if the page can be framed
            const result = await checkFrameability();
            
            // Clear any existing messages
            const existingMessage = document.querySelector('.error-message');
            if (existingMessage) {
                existingMessage.remove();
            }

            // Only show vulnerability message if we're sure
            if (result === 'vulnerable' && iframe.contentWindow && iframe.contentWindow.length !== 0) {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'error-message vulnerable';
                messageDiv.innerHTML = `
                    <span class="status-icon">⚠️</span>
                    <span>This site might be vulnerable to clickjacking!</span>
                `;
                urlInput.parentNode.insertBefore(messageDiv, submitButton.nextSibling);
            }
        } catch (e) {
            showMessage('Error testing the URL');
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
