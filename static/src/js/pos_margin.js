/** @odoo-module */

console.log('Pitcar Margin: Module loading...');

function startMarginObserver() {
    if (!document.body) {
        setTimeout(startMarginObserver, 100);
        return;
    }
    
    console.log('Pitcar Margin: Starting observer...');
    
    function updateMargin() {
        try {
            const popup = document.querySelector('.modal-dialog, .popup, .modal-content');
            
            if (!popup) {
                return;
            }
            
            const allText = popup.textContent;
            
            // Extract Cost and Price
            const costMatch = allText.match(/Total Cost:\s*Rp\s*([\d,]+\.?\d*)/);
            const priceMatch = allText.match(/Total Price.*VAT:\s*Rp\s*([\d,]+\.?\d*)/);
            
            if (costMatch && priceMatch) {
                const cost = parseFloat(costMatch[1].replace(/,/g, ''));
                const price = parseFloat(priceMatch[1].replace(/,/g, ''));
                
                if (cost > 0) {
                    const margin = price - cost;
                    const markup = ((margin / cost) * 100).toFixed(2);
                    
                    console.log('Pitcar Margin: Calculating...', {
                        cost: cost,
                        price: price,
                        margin: margin,
                        markup: markup + '%'
                    });
                    
                    // Find ALL text containing percentage in parentheses
                    const elements = popup.querySelectorAll('*');
                    let replacedCount = 0;
                    
                    elements.forEach(el => {
                        // Check direct text content (no children)
                        if (el.children.length === 0) {
                            const text = el.textContent;
                            
                            // Match pattern like "(61.28%)" or "61.28%"
                            if (/\(?\d+\.\d+%\)?/.test(text)) {
                                const newText = text.replace(/\(?\d+\.\d+%\)?/, `(${markup}%)`);
                                
                                if (newText !== text) {
                                    el.textContent = newText;
                                    replacedCount++;
                                    console.log('✓ Replaced:', text, '→', newText);
                                }
                            }
                        }
                        
                        // Also check child text nodes
                        el.childNodes.forEach(node => {
                            if (node.nodeType === Node.TEXT_NODE) {
                                const text = node.textContent;
                                
                                if (/\(?\d+\.\d+%\)?/.test(text)) {
                                    const newText = text.replace(/\(?\d+\.\d+%\)?/, `(${markup}%)`);
                                    
                                    if (newText !== text) {
                                        node.textContent = newText;
                                        replacedCount++;
                                        console.log('✓ Replaced text node:', text, '→', newText);
                                    }
                                }
                            }
                        });
                    });
                    
                    if (replacedCount > 0) {
                        console.log('✓✓ Pitcar Margin: Successfully updated', replacedCount, 'instances');
                    } else {
                        console.warn('⚠ Pitcar Margin: No replacements made - check selector');
                    }
                }
            } else {
                console.log('Pitcar Margin: Could not find cost/price', {
                    costMatch: costMatch,
                    priceMatch: priceMatch
                });
            }
        } catch (error) {
            console.error('Pitcar Margin: Error', error);
        }
    }
    
    // Observer for popup
    const observer = new MutationObserver((mutations) => {
        try {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) {
                        if (node.classList?.contains('modal') || 
                            node.classList?.contains('popup') ||
                            node.querySelector?.('.modal-dialog')) {
                            
                            console.log('Pitcar Margin: Popup detected!');
                            setTimeout(updateMargin, 50);
                            setTimeout(updateMargin, 150);
                            setTimeout(updateMargin, 300);
                            setTimeout(updateMargin, 500);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Pitcar Margin: Observer error', error);
        }
    });
    
    try {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        console.log('✓ Pitcar Margin: Observer started');
    } catch (error) {
        console.error('Pitcar Margin: Failed to start observer', error);
    }
    
    // Fallback runs
    setTimeout(updateMargin, 1000);
    setTimeout(updateMargin, 2000);
    setTimeout(updateMargin, 3000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startMarginObserver);
} else {
    startMarginObserver();
}

console.log('✓ Pitcar Margin: Module loaded');
