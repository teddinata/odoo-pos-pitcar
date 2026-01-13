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
        addProductTags();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    setTimeout(() => {
        addStockBadges();
        addProductTags();
    }, 1000);
    setTimeout(() => {
        addStockBadges();
        addProductTags();
    }, 3000);
    setTimeout(() => {
        addStockBadges();
        addProductTags();
    }, 5000);
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
        
        /* Product Tags Styles */
        .pos-product-tags {
            position: relative !important;
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 4px !important;
            margin: 4px 8px !important;
            pointer-events: none !important;
        }
        
        .pos-product-tag {
            display: inline-block !important;
            padding: 2px 8px !important;
            border-radius: 3px !important;
            font-size: 9px !important;
            font-weight: 500 !important;
            color: white !important;
            background-color: #6c757d !important;
            white-space: nowrap !important;
            max-width: 120px !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
        }
        
        /* Tag color variations */
        .pos-product-tag[data-color="1"] { background-color: #e74c3c !important; }
        .pos-product-tag[data-color="2"] { background-color: #e67e22 !important; }
        .pos-product-tag[data-color="3"] { background-color: #f39c12 !important; }
        .pos-product-tag[data-color="4"] { background-color: #f1c40f !important; color: #333 !important; }
        .pos-product-tag[data-color="5"] { background-color: #2ecc71 !important; }
        .pos-product-tag[data-color="6"] { background-color: #1abc9c !important; }
        .pos-product-tag[data-color="7"] { background-color: #3498db !important; }
        .pos-product-tag[data-color="8"] { background-color: #9b59b6 !important; }
        .pos-product-tag[data-color="9"] { background-color: #34495e !important; }
        .pos-product-tag[data-color="10"] { background-color: #95a5a6 !important; }
    `;
    document.head.appendChild(style);
    console.log('POS Stock Display: Global styles added');
}

function addStockBadges() {
    const pos = window.posmodel || odoo.__DEBUG__?.services?.pos;
    
    if (!pos) {
        console.log('POS Stock Display: POS not ready yet');
        return;
    }
    
    const articles = document.querySelectorAll('article');
    
    if (articles.length === 0) {
        console.log('POS Stock Display: No articles found yet');
        return;
    }
    
    console.log(`POS Stock Display: Found ${articles.length} articles`);
    
    articles.forEach((article, index) => {
        try {
            if (article.querySelector('.pos-stock-badge')) {
                return;
            }
            
            const productId = getProductIdFromArticle(article);
            
            if (!productId) {
                return;
            }
            
            const product = pos.db.get_product_by_id(productId);
            
            if (!product) {
                return;
            }
            
            if (product.type !== 'product') {
                return;
            }
            
            const qty = parseFloat(product.qty_available || 0);
            const level = qty > 20 ? 'high' : qty > 10 ? 'medium' : qty > 0 ? 'low' : 'out';
            const text = qty > 0 ? `Stok: ${Math.round(qty)}` : 'Habis';
            
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

// Global cache for tags (fetch once, use many times)
let cachedTags = null;
let tagsFetching = false;

async function addProductTags() {
    const pos = window.posmodel || odoo.__DEBUG__?.services?.pos;
    
    if (!pos) {
        console.log('POS Tags: POS not ready yet');
        return;
    }
    
    const articles = document.querySelectorAll('article');
    
    if (articles.length === 0) {
        console.log('POS Tags: No articles found yet');
        return;
    }
    
    console.log(`POS Tags: Processing ${articles.length} articles for tags`);
    
    // Collect all tag IDs from all products
    const allTagIds = new Set();
    const productTagMap = {}; // Map product ID to tag IDs
    
    articles.forEach(article => {
        const productId = getProductIdFromArticle(article);
        if (!productId) return;
        
        const product = pos.db.get_product_by_id(productId);
        if (!product || !product.tag_ids || product.tag_ids.length === 0) return;
        
        productTagMap[productId] = product.tag_ids;
        product.tag_ids.forEach(tagId => allTagIds.add(tagId));
    });
    
    if (allTagIds.size === 0) {
        console.log('POS Tags: No products with tags found');
        return;
    }
    
    console.log(`POS Tags: Found ${allTagIds.size} unique tag IDs to fetch`);
    
    // Fetch tags if not cached
    if (!cachedTags && !tagsFetching) {
        tagsFetching = true;
        
        try {
            console.log('POS Tags: Fetching tag data via RPC...');
            
            const response = await fetch('/web/dataset/call_kw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'call',
                    params: {
                        model: 'product.tag',
                        method: 'search_read',
                        args: [[['id', 'in', Array.from(allTagIds)]], ['name', 'color']],
                        kwargs: {}
                    },
                    id: Date.now()
                })
            });
            
            const data = await response.json();
            
            if (data.result) {
                cachedTags = {};
                data.result.forEach(tag => {
                    cachedTags[tag.id] = tag;
                });
                
                console.log(`POS Tags: ✓ Fetched ${data.result.length} tags:`, cachedTags);
            }
            
        } catch (error) {
            console.error('POS Tags: Error fetching tags:', error);
            cachedTags = {}; // Set empty to prevent retry
        } finally {
            tagsFetching = false;
        }
    }
    
    // Wait for tags to be fetched
    if (tagsFetching) {
        console.log('POS Tags: Waiting for tags to be fetched...');
        setTimeout(() => addProductTags(), 500);
        return;
    }
    
    if (!cachedTags) {
        console.warn('POS Tags: No cached tags available');
        return;
    }
    
    // Now add tags to products
    let tagsAdded = 0;
    
    articles.forEach((article, index) => {
        try {
            if (article.querySelector('.pos-product-tags')) {
                return;
            }
            
            const productId = getProductIdFromArticle(article);
            if (!productId) return;
            
            const tagIds = productTagMap[productId];
            if (!tagIds || tagIds.length === 0) return;
            
            const tagsContainer = document.createElement('div');
            tagsContainer.className = 'pos-product-tags';
            
            tagIds.forEach(tagId => {
                const tag = cachedTags[tagId];
                if (!tag) return;
                
                const tagElement = document.createElement('span');
                tagElement.className = 'pos-product-tag';
                tagElement.textContent = tag.name;
                
                if (tag.color) {
                    tagElement.setAttribute('data-color', tag.color);
                }
                
                tagsContainer.appendChild(tagElement);
                
                if (index === 0) {
                    console.log(`POS Tags: Added tag "${tag.name}" (color: ${tag.color})`);
                }
            });
            
            if (tagsContainer.children.length > 0) {
                article.appendChild(tagsContainer);
                tagsAdded++;
            }
            
        } catch (error) {
            console.error('POS Tags: Error adding tag to article:', error);
        }
    });
    
    console.log(`POS Tags: ✓ Successfully added tags to ${tagsAdded} products`);
}

function getProductIdFromArticle(article) {
    try {
        if (article.dataset.productId) {
            return parseInt(article.dataset.productId);
        }
        
        const className = article.className;
        const match = className.match(/product-(\d+)/);
        if (match) {
            return parseInt(match[1]);
        }
        
        const productIdElement = article.querySelector('[data-product-id]');
        if (productIdElement) {
            return parseInt(productIdElement.dataset.productId);
        }
        
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