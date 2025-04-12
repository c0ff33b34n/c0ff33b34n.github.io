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

    function showError(message) {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        urlInput.parentNode.insertBefore(errorDiv, submitButton.nextSibling);

        // Remove error after 5 seconds
        setTimeout(() => errorDiv.remove(), 5000);
    }

    function frameIt() {
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
        submitButton.textContent = 'Loading...';

        // Load the URL in the iframe
        try {
            iframe.src = url;
        } catch (e) {
            showError('Error loading the URL. Make sure the site allows framing.');
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
            submitButton.textContent = 'Test URL';
            return;
        }

        // Reset button state after iframe loads or errors
        iframe.onload = iframe.onerror = function(e) {
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
            submitButton.textContent = 'Test URL';

            // Check if the page loaded successfully
            try {
                // Try to access iframe content - if blocked, it means X-Frame-Options is set
                const iframeContent = iframe.contentWindow.document;
                // If we can access the content, the site is vulnerable to clickjacking
                showError('⚠️ This site might be vulnerable to clickjacking!');
            } catch (e) {
                // If we can't access the content, the site is protected
                showError('✅ This site is protected against clickjacking');
            }
        };
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
