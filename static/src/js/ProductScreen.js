/** @odoo-module */

/**
 * Ultra-simple stock display
 * Directly manipulates DOM on load
 */

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStockDisplay);
} else {
    initStockDisplay();
}

function initStockDisplay() {
    console.log('POS Stock Display: Initializing...');
    
    // Add global style
    addGlobalStyle();
    
    // Watch for POS screen changes
    const observer = new MutationObserver(() => {
        addStockBadges();
    });
    
    // Observe body for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Initial run
    setTimeout(() => addStockBadges(), 1000);
    setTimeout(() => addStockBadges(), 3000);
    setTimeout(() => addStockBadges(), 5000);
}

function addGlobalStyle() {
    const style = document.createElement('style');
    style.textContent = `
        .pos-stock-badge {
            position: relative !important;
            display: block !important;
            margin: 8px 0 8px 8px !important;
            text-align: left !important;
            width: fit-content !important;
            padding: 3px 10px !important;
            border-radius: 4px !important;
            font-size: 10px !important;
            font-weight: bold !important;
            z-index: 999 !important;
            pointer-events: none !important;
        }
        
        .pos-stock-high {
            background-color: #28a745 !important;
            color: white !important;
        }
        
        .pos-stock-medium {
            background-color: #ffc107 !important;
            color: #212529 !important;
        }
        
        .pos-stock-low {
            background-color: #dc3545 !important;
            color: white !important;
        }
        
        .pos-stock-out {
            background-color: #6c757d !important;
            color: white !important;
        }
    `;
    document.head.appendChild(style);
    console.log('POS Stock Display: Global styles added');
}

function addStockBadges() {
    // Find all product articles
    const articles = document.querySelectorAll('article');
    
    if (articles.length === 0) {
        console.log('POS Stock Display: No articles found yet');
        return;
    }
    
    console.log(`POS Stock Display: Found ${articles.length} articles`);
    
    articles.forEach((article, index) => {
        try {
            // Skip if already has badge
            if (article.querySelector('.pos-stock-badge')) {
                return;
            }
            
            // For now, add test badge with random stock
            const testQty = Math.floor(Math.random() * 30);
            const level = testQty > 20 ? 'high' : testQty > 10 ? 'medium' : testQty > 0 ? 'low' : 'out';
            const text = testQty > 0 ? `Stok: ${testQty}` : 'Habis';
            
            const badge = document.createElement('div');
            badge.className = `pos-stock-badge pos-stock-${level}`;
            badge.textContent = text;
            
            article.appendChild(badge);
            
            if (index === 0) {
                console.log('POS Stock Display: Badge added to first product:', text);
            }
            
        } catch (error) {
            console.error('POS Stock Display: Error adding badge:', error);
        }
    });
}

console.log('POS Stock Display: Module loaded');