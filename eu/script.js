document.addEventListener('DOMContentLoaded', () => {
    // TradingView Widget initialization
    const initTradingViewWidget = () => {
        // Clear previous widget if exists
        const chartContainer = document.getElementById('tradingview_chart');
        chartContainer.innerHTML = '';
        
        // Create new TradingView widget
        new TradingView.widget({
            "width": "100%",
            "height": "100%",
            "symbol": "FX:EURUSD",
            "interval": "1D", // Default timeframe
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
            "locale": "en",
            "toolbar_bg": "#f1f3f6",
            "enable_publishing": false,
            "allow_symbol_change": true,
            "container_id": "tradingview_chart",
            "hide_side_toolbar": false
        });
    };
    
    // Initialize with default timeframe (1D)
    initTradingViewWidget();
}); 