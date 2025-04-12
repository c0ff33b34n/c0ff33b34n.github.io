document.addEventListener('DOMContentLoaded', function () {
    const urlInput = document.getElementById('url');
    const submitButton = document.getElementById('submit-test');
    const iframe = document.getElementById('iframe');

    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }

    function frameIt() {
        const url = urlInput.value.trim();
        
        // Reset iframe
        iframe.src = 'about:blank';

        // Validate URL
        if (!url) {
            alert('Please enter a URL');
            return;
        }

        if (!isValidUrl(url)) {
            alert('Please enter a valid URL (e.g., http://example.com)');
            return;
        }

        // Update button state
        submitButton.disabled = true;
        submitButton.style.opacity = '0.7';
        submitButton.textContent = 'Loading...';

        // Load the URL in the iframe
        iframe.src = url;

        // Reset button state after iframe loads or errors
        iframe.onload = iframe.onerror = function() {
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
            submitButton.textContent = 'Test URL';
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
