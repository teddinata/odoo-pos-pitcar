/** @odoo-module */

import { Product } from 'point_of_sale.models';
import { patch } from "@web/core/utils/patch";

/**
 * Extend Product model to include stock display methods
 * Safe implementation with fallbacks
 */
patch(Product.prototype, {
    
    /**
     * Get current available stock quantity
     * @returns {number} Stock quantity, defaults to 0
     */
    get_stock_quantity() {
        // Try pos_qty_available first (location-specific)
        if (this.pos_qty_available !== undefined) {
            return parseFloat(this.pos_qty_available) || 0;
        }
        
        // Fallback to qty_available
        if (this.qty_available !== undefined) {
            return parseFloat(this.qty_available) || 0;
        }
        
        // Default to 0 for service/consumable products
        return 0;
    },

    /**
     * Get stock level category for color coding
     * @returns {string} 'high', 'medium', 'low', or 'out'
     */
    get_stock_level() {
        const qty = this.get_stock_quantity();
        
        if (qty <= 0) {
            return 'out';
        } else if (qty < 10) {
            return 'low';
        } else if (qty <= 20) {
            return 'medium';
        } else {
            return 'high';
        }
    },

    /**
     * Get CSS class for stock badge
     * @returns {string} CSS class name
     */
    get_stock_badge_class() {
        const level = this.get_stock_level();
        return `stock-${level}`;
    },

    /**
     * Check if product is storable (has inventory tracking)
     * @returns {boolean} True if product type is 'product'
     */
    is_storable() {
        return this.type === 'product';
    },

    /**
     * Check if stock should be displayed for this product
     * @returns {boolean} True if stock should be shown
     */
    should_display_stock() {
        // Only show stock for storable products
        return this.is_storable();
    },

    /**
     * Get formatted stock text for display
     * @returns {string} Formatted stock string
     */
    get_stock_display_text() {
        if (!this.should_display_stock()) {
            return '';
        }
        
        const qty = this.get_stock_quantity();
        
        // Round to 2 decimal places for display
        const rounded_qty = Math.round(qty * 100) / 100;
        
        if (rounded_qty <= 0) {
            return 'Habis';
        }
        
        return `Stok: ${rounded_qty}`;
    },

    /**
     * Check if product has sufficient stock for quantity
     * @param {number} qty Requested quantity
     * @returns {boolean} True if stock is sufficient
     */
    has_sufficient_stock(qty) {
        if (!this.is_storable()) {
            return true; // Service/consumable products always available
        }
        
        const available = this.get_stock_quantity();
        return available >= qty;
    },
});
