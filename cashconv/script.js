class CurrencyConverter {
    constructor() {
        // DOM elements
        this.amountInput = document.getElementById('amount');
        this.fromCurrencySelect = document.getElementById('fromCurrency');
        this.toCurrencySelect = document.getElementById('toCurrency');
        this.resultAmount = document.getElementById('resultAmount');
        this.resultRate = document.getElementById('resultRate');
        this.convertBtn = document.getElementById('convertBtn');
        this.swapBtn = document.getElementById('swapBtn');
        this.lastUpdated = document.getElementById('lastUpdated');
        this.popularCurrencies = document.getElementById('popularCurrencies');
        
        // API key - Replace with your own API key from https://exchangerate-api.com/
        this.apiKey = 'YOUR_API_KEY';
        this.apiUrl = 'https://v6.exchangerate-api.com/v6/';
        
        // Popular currencies to display
        this.popularCurrencyCodes = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'];
        
        // Store exchange rates
        this.exchangeRates = {};
        this.currencies = {};
        
        // Initialize
        this.init();
    }
    
    async init() {
        // Add event listeners
        this.convertBtn.addEventListener('click', () => this.convert());
        this.swapBtn.addEventListener('click', () => this.swapCurrencies());
        this.amountInput.addEventListener('input', () => this.convert());
        this.fromCurrencySelect.addEventListener('change', () => this.convert());
        this.toCurrencySelect.addEventListener('change', () => this.convert());
        
        // Fetch exchange rates and populate currency dropdowns
        await this.fetchExchangeRates();
        this.populateCurrencyDropdowns();
        this.createPopularCurrencyCards();
        
        // Perform initial conversion
        this.convert();
    }
    
    async fetchExchangeRates() {
        try {
            // For demo purposes, we'll use a free API that doesn't require an API key
            // In a real application, you would use your API key
            const response = await fetch('https://open.er-api.com/v6/latest/USD');
            
            if (!response.ok) {
                throw new Error('Failed to fetch exchange rates');
            }
            
            const data = await response.json();
            this.exchangeRates = data.rates;
            this.lastUpdated.textContent = new Date().toLocaleString();
            
            // Get currency names
            const currenciesResponse = await fetch('https://open.er-api.com/v6/latest/USD');
            const currenciesData = await currenciesResponse.json();
            this.currencies = currenciesData.rates;
            
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            this.resultAmount.textContent = 'Error loading exchange rates';
            this.resultRate.textContent = 'Please try again later';
        }
    }
    
    populateCurrencyDropdowns() {
        // Clear existing options
        this.fromCurrencySelect.innerHTML = '';
        this.toCurrencySelect.innerHTML = '';
        
        // Add currency options
        for (const code in this.exchangeRates) {
            const fromOption = document.createElement('option');
            fromOption.value = code;
            fromOption.textContent = code;
            this.fromCurrencySelect.appendChild(fromOption);
            
            const toOption = document.createElement('option');
            toOption.value = code;
            toOption.textContent = code;
            this.toCurrencySelect.appendChild(toOption);
        }
        
        // Set default values
        this.fromCurrencySelect.value = 'USD';
        this.toCurrencySelect.value = 'EUR';
    }
    
    createPopularCurrencyCards() {
        this.popularCurrencies.innerHTML = '';
        
        this.popularCurrencyCodes.forEach(code => {
            const card = document.createElement('div');
            card.className = 'currency-card';
            card.innerHTML = `
                <div class="code">${code}</div>
                <div class="name">${this.getCurrencyName(code)}</div>
            `;
            
            card.addEventListener('click', () => {
                this.fromCurrencySelect.value = code;
                this.convert();
            });
            
            this.popularCurrencies.appendChild(card);
        });
    }
    
    getCurrencyName(code) {
        const currencyNames = {
            'USD': 'US Dollar',
            'EUR': 'Euro',
            'GBP': 'British Pound',
            'JPY': 'Japanese Yen',
            'AUD': 'Australian Dollar',
            'CAD': 'Canadian Dollar',
            'CHF': 'Swiss Franc',
            'CNY': 'Chinese Yuan',
            'INR': 'Indian Rupee'
        };
        
        return currencyNames[code] || code;
    }
    
    convert() {
        const amount = parseFloat(this.amountInput.value);
        const fromCurrency = this.fromCurrencySelect.value;
        const toCurrency = this.toCurrencySelect.value;
        
        if (isNaN(amount) || amount <= 0) {
            this.resultAmount.textContent = 'Please enter a valid amount';
            return;
        }
        
        if (!this.exchangeRates[fromCurrency] || !this.exchangeRates[toCurrency]) {
            this.resultAmount.textContent = 'Currency not available';
            return;
        }
        
        // Calculate conversion
        const fromRate = this.exchangeRates[fromCurrency];
        const toRate = this.exchangeRates[toCurrency];
        const convertedAmount = (amount / fromRate) * toRate;
        
        // Calculate exchange rate
        const exchangeRate = toRate / fromRate;
        
        // Update result
        this.resultAmount.textContent = `${amount.toFixed(2)} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`;
        this.resultRate.textContent = `Exchange Rate: 1 ${fromCurrency} = ${exchangeRate.toFixed(4)} ${toCurrency}`;
    }
    
    swapCurrencies() {
        const temp = this.fromCurrencySelect.value;
        this.fromCurrencySelect.value = this.toCurrencySelect.value;
        this.toCurrencySelect.value = temp;
        this.convert();
    }
}

// Initialize the converter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const converter = new CurrencyConverter();
}); 