/** @odoo-module */

import { ProductCard } from "@point_of_sale/app/generic_components/product_card/product_card";
import { patch } from "@web/core/utils/patch";
import { useService } from "@web/core/utils/hooks";
import { onMounted } from "@odoo/owl";

/**
 * Extend ProductCard component to display stock information
 * Safe implementation with proper error handling
 */
patch(ProductCard.prototype, {
    
    setup() {
        super.setup(...arguments);
        this.notification = useService("notification");
        
        onMounted(() => {
            this.addStockBadge();
        });
    },

    /**
     * Add stock badge to product card after mounting
     */
    addStockBadge() {
        try {
            if (!this.shouldDisplayStock) {
                return;
            }
            
            // Get the card element - try multiple selectors
            const cardElement = this.el || 
                               this.__owl__?.bdom?.el ||
                               document.querySelector(`[data-product-id="${this.props.product?.id}"]`);
            
            if (!cardElement) {
                console.warn('Could not find card element for stock badge');
                return;
            }
            
            // Check if badge already exists
            if (cardElement.querySelector('.product-stock-badge')) {
                return;
            }
            
            // Create stock badge
            const badge = document.createElement('div');
            badge.className = `product-stock-badge ${this.stockBadgeClass}`;
            badge.textContent = this.stockDisplayText;
            
            // Add to card
            cardElement.style.position = 'relative';
            cardElement.appendChild(badge);
            
            // Add out of stock overlay class if needed
            if (this.stockLevel === 'out') {
                cardElement.classList.add('product-out-of-stock');
            }
            
        } catch (error) {
            console.error('Error adding stock badge:', error);
        }
    },

    /**
     * Get stock quantity for display
     * @returns {number} Available stock quantity
     */
    get stockQuantity() {
        try {
            if (this.props.product && typeof this.props.product.get_stock_quantity === 'function') {
                return this.props.product.get_stock_quantity();
            }
            return 0;
        } catch (error) {
            console.error('Error getting stock quantity:', error);
            return 0;
        }
    },

    /**
     * Get stock level category
     * @returns {string} Stock level: 'high', 'medium', 'low', or 'out'
     */
    get stockLevel() {
        try {
            if (this.props.product && typeof this.props.product.get_stock_level === 'function') {
                return this.props.product.get_stock_level();
            }
            return 'out';
        } catch (error) {
            console.error('Error getting stock level:', error);
            return 'out';
        }
    },

    /**
     * Get CSS class for stock badge
     * @returns {string} CSS class name
     */
    get stockBadgeClass() {
        try {
            if (this.props.product && typeof this.props.product.get_stock_badge_class === 'function') {
                return this.props.product.get_stock_badge_class();
            }
            return 'stock-out';
        } catch (error) {
            console.error('Error getting badge class:', error);
            return 'stock-out';
        }
    },

    /**
     * Check if stock should be displayed
     * @returns {boolean} True if stock display is enabled for this product
     */
    get shouldDisplayStock() {
        try {
            if (this.props.product && typeof this.props.product.should_display_stock === 'function') {
                return this.props.product.should_display_stock();
            }
            return false;
        } catch (error) {
            console.error('Error checking stock display:', error);
            return false;
        }
    },

    /**
     * Get formatted stock text
     * @returns {string} Display text for stock
     */
    get stockDisplayText() {
        try {
            if (this.props.product && typeof this.props.product.get_stock_display_text === 'function') {
                return this.props.product.get_stock_display_text();
            }
            return '';
        } catch (error) {
            console.error('Error getting stock display text:', error);
            return '';
        }
    },

    /**
     * Override click handler to show warning for low/out of stock
     */
    async onClick() {
        try {
            // Check stock level before adding to cart
            if (this.shouldDisplayStock) {
                const stockLevel = this.stockLevel;
                const stockQty = this.stockQuantity;
                
                // Show warning for low stock
                if (stockLevel === 'low' && stockQty > 0) {
                    this.notification.add(
                        `Peringatan: Stok ${this.props.product.display_name} tinggal ${stockQty} unit`,
                        {
                            type: 'warning',
                            duration: 3000,
                        }
                    );
                }
                
                // Show warning for out of stock
                if (stockLevel === 'out') {
                    this.notification.add(
                        `Peringatan: ${this.props.product.display_name} sedang habis stok`,
                        {
                            type: 'warning',
                            duration: 4000,
                        }
                    );
                }
            }
            
            // Call parent onClick to add product
            return super.onClick(...arguments);
            
        } catch (error) {
            console.error('Error in ProductCard onClick:', error);
            // Still allow adding product even if stock check fails
            return super.onClick(...arguments);
        }
    },
});