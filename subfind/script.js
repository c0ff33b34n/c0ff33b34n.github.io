document.addEventListener('DOMContentLoaded', () => {
    const domainInput = document.getElementById('domain');
    const searchButton = document.getElementById('search');
    const statusDiv = document.getElementById('status');
    const resultsDiv = document.getElementById('results');
    const downloadBtn = document.getElementById('download');
    const wordlistToggle = document.getElementById('wordlist-toggle');
    const wordlistUpload = document.querySelector('.wordlist-upload');
    const wordlistFile = document.getElementById('wordlist-file');
    const wordlistUrl = document.getElementById('wordlist-url');
    const loadUrlBtn = document.getElementById('load-url');

    // Default subdomains list
    const defaultSubdomains = [
        'www', 'mail', 'ftp', 'localhost', 'webmail', 'smtp', 'pop', 'ns1', 'ns2',
        'ns3', 'ns4', 'test', 'dev', 'staging', 'api', 'blog', 'shop', 'store',
        'admin', 'secure', 'portal', 'cdn', 'static', 'media', 'images', 'img',
        'download', 'support', 'help', 'docs', 'status', 'monitor', 'dashboard'
    ];

    let customWordlist = null;

    // Toggle wordlist upload section
    wordlistToggle.addEventListener('change', () => {
        wordlistUpload.style.display = wordlistToggle.checked ? 'flex' : 'none';
        if (!wordlistToggle.checked) {
            wordlistFile.value = '';
            wordlistUrl.value = '';
            customWordlist = null;
        }
    });

    // Process wordlist content
    function processWordlist(text) {
        return text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'));
    }

    // Get status code class
    function getStatusCodeClass(status) {
        if (status === 'Active') return 'success';
        if (status === 'DNS-Only') return 'unknown';
        if (!status || status === 'Unknown') return 'unknown';
        
        const statusNum = parseInt(status);
        if (isNaN(statusNum)) return 'unknown';
        
        if (statusNum >= 200 && statusNum < 300) return 'success';
        if (statusNum >= 300 && statusNum < 400) return 'redirect';
        if (statusNum >= 400 && statusNum < 500) return 'client-error';
        if (statusNum >= 500 && statusNum < 600) return 'server-error';
        return 'unknown';
    }

    // Handle wordlist file upload
    wordlistFile.addEventListener('change', async (e) => {
        try {
            const file = e.target.files[0];
            if (!file) {
                customWordlist = null;
                return;
            }

            const text = await file.text();
            customWordlist = processWordlist(text);
            wordlistUrl.value = '';
            statusDiv.textContent = `Loaded ${customWordlist.length} subdomains from file`;
        } catch (error) {
            statusDiv.textContent = 'Error loading wordlist file';
            console.error('Error:', error);
            customWordlist = null;
        }
    });

    // Handle loading wordlist from URL
    loadUrlBtn.addEventListener('click', async () => {
        const url = wordlistUrl.value.trim();
        if (!url) {
            statusDiv.textContent = 'Please enter a wordlist URL';
            return;
        }

        try {
            statusDiv.textContent = 'Loading wordlist from URL...';
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            customWordlist = processWordlist(text);
            wordlistFile.value = '';
            statusDiv.textContent = `Loaded ${customWordlist.length} subdomains from URL`;
        } catch (error) {
            statusDiv.textContent = 'Error loading wordlist from URL';
            console.error('Error:', error);
            customWordlist = null;
        }
    });

    async function checkSubdomain(subdomain, domain) {
        const dnsUrl = `https://dns.google/resolve?name=${subdomain}.${domain}&type=A`;
        try {
            const response = await fetch(dnsUrl);
            const data = await response.json();
            if (data.Answer && data.Answer.length > 0) {
                // Try both HTTPS and HTTP
                try {
                    // Try HTTPS first
                    const httpsResponse = await fetch(`https://${subdomain}.${domain}`, {
                        method: 'HEAD'
                    });
                    return { exists: true, status: httpsResponse.status };
                } catch (httpsError) {
                    try {
                        // If HTTPS fails, try HTTP
                        const httpResponse = await fetch(`http://${subdomain}.${domain}`, {
                            method: 'HEAD'
                        });
                        return { exists: true, status: httpResponse.status };
                    } catch (httpError) {
                        // If both fail but DNS exists, try a GET request with no-cors
                        try {
                            await fetch(`https://${subdomain}.${domain}`, {
                                mode: 'no-cors'
                            });
                            // If we reach here, the domain is accessible but status is restricted
                            return { exists: true, status: 'Active' };
                        } catch (error) {
                            // If everything fails but DNS exists, mark as DNS-only
                            return { exists: true, status: 'DNS-Only' };
                        }
                    }
                }
            }
            return { exists: false };
        } catch (error) {
            return { exists: false };
        }
    }

    function downloadResults(domain, results) {
        const filename = `${domain}_subdomains.txt`;
        const content = results.map(result => {
            const status = result.status ? ` [${result.status}]` : '';
            return `${result.subdomain}${status}`;
        }).join('\n');
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    downloadBtn.addEventListener('click', () => {
        const domain = domainInput.value.trim();
        const results = Array.from(resultsDiv.children).map(child => ({
            subdomain: child.querySelector('.subdomain-text').textContent,
            status: child.querySelector('.status-code').textContent.match(/\d+/)?.[0] || 0
        }));
        downloadResults(domain, results);
    });

    searchButton.addEventListener('click', async () => {
        const domain = domainInput.value.trim();
        if (!domain) {
            statusDiv.textContent = 'Please enter a domain';
            downloadBtn.style.display = 'none';
            return;
        }

        // Clear previous results and hide download button
        resultsDiv.innerHTML = '';
        downloadBtn.style.display = 'none';
        statusDiv.textContent = 'Searching for subdomains...';

        try {
            const subdomainsToCheck = wordlistToggle.checked && customWordlist ? 
                customWordlist : defaultSubdomains;

            const foundSubdomains = [];
            const promises = subdomainsToCheck.map(subdomain => 
                checkSubdomain(subdomain, domain)
                    .then(result => {
                        if (result.exists) {
                            const fullDomain = `${subdomain}.${domain}`;
                            foundSubdomains.push({ subdomain: fullDomain, status: result.status });
                            
                            // Create result item
                            const resultItem = document.createElement('div');
                            resultItem.className = 'result-item';
                            
                            // Add subdomain text
                            const subdomainText = document.createElement('span');
                            subdomainText.className = 'subdomain-text';
                            subdomainText.textContent = fullDomain;
                            resultItem.appendChild(subdomainText);
                            
                            // Add status code
                            const statusCode = document.createElement('span');
                            statusCode.className = `status-code ${getStatusCodeClass(result.status)}`;
                            statusCode.textContent = result.status || 'Unknown';
                            resultItem.appendChild(statusCode);
                            
                            resultsDiv.appendChild(resultItem);
                            downloadBtn.style.display = 'inline-block';
                        }
                    })
            );

            await Promise.all(promises);

            // Update final status
            if (foundSubdomains.length > 0) {
                statusDiv.textContent = `Found ${foundSubdomains.length} subdomains:`;
            } else {
                statusDiv.textContent = 'No subdomains found';
                downloadBtn.style.display = 'none';
            }
        } catch (error) {
            statusDiv.textContent = 'Error occurred while searching for subdomains';
            downloadBtn.style.display = 'none';
            console.error('Error:', error);
        }
    });
}); 