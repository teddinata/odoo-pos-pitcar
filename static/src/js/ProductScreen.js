/** @odoo-module */

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStockDisplay);
} else {
    initStockDisplay();
}

function initStockDisplay() {
    console.log('POS Stock Display: Initializing...');
    
    addGlobalStyle();
    
    const observer = new MutationObserver(() => {
        addStockBadges();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
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
    // Get POS instance
    const pos = window.posmodel || odoo.__DEBUG__?.services?.pos;
    
    if (!pos) {
        console.log('POS Stock Display: POS not ready yet');
        return;
    }
    
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
            
            // Get product ID from article
            const productId = getProductIdFromArticle(article);
            
            if (!productId) {
                return;
            }
            
            // Get product from POS database
            const product = pos.db.get_product_by_id(productId);
            
            if (!product) {
                return;
            }
            
            // Only show stock for storable products
            if (product.type !== 'product') {
                return;
            }
            
            // Get real stock quantity
            const qty = parseFloat(product.qty_available || 0);
            const level = qty > 20 ? 'high' : qty > 10 ? 'medium' : qty > 0 ? 'low' : 'out';
            const text = qty > 0 ? `Stok: ${Math.round(qty)}` : 'Habis';
            
            // Create badge
            const badge = document.createElement('div');
            badge.className = `pos-stock-badge pos-stock-${level}`;
            badge.textContent = text;
            
            article.appendChild(badge);
            
            if (index === 0) {
                console.log('POS Stock Display: Badge added to first product:', product.display_name, 'qty:', qty);
            }
            
        } catch (error) {
            console.error('POS Stock Display: Error adding badge:', error);
        }
    });
}

function getProductIdFromArticle(article) {
    // Try multiple methods to get product ID
    try {
        // Method 1: data-product-id attribute
        if (article.dataset.productId) {
            return parseInt(article.dataset.productId);
        }
        
        // Method 2: From onclick attribute or class
        const className = article.className;
        const match = className.match(/product-(\d+)/);
        if (match) {
            return parseInt(match[1]);
        }
        
        // Method 3: Find in child elements
        const productIdElement = article.querySelector('[data-product-id]');
        if (productIdElement) {
            return parseInt(productIdElement.dataset.productId);
        }
        
        // Method 4: Check article attributes
        for (let attr of article.attributes) {
            if (attr.name.includes('product') && !isNaN(attr.value)) {
                return parseInt(attr.value);
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error getting product ID:', error);
        return null;
    }
}

console.log('POS Stock Display: Module loaded');