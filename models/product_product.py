# -*- coding: utf-8 -*-

from odoo import models, fields, api


class ProductProduct(models.Model):
    _inherit = 'product.product'

    @api.model
    def _load_pos_data_fields(self, config_id):
        """Add stock quantity fields to POS product data"""
        fields = super()._load_pos_data_fields(config_id)
        fields.extend(['qty_available', 'type'])
        return fields

    def _get_stock_for_pos(self, location_id):
        """
        Get stock quantity for specific location
        Safe method with error handling
        """
        self.ensure_one()
        
        # Only get stock for storable products
        if self.type != 'product':
            return 0.0
        
        try:
            # Use with_context to get stock for specific location
            product = self.with_context(location=location_id)
            return product.qty_available or 0.0
        except Exception:
            # Return 0 if any error occurs
            return 0.0

    def _load_pos_data(self, data):
        """
        Override to add location-specific stock data
        This ensures stock data is fresh when POS session loads
        """
        domain = data.get('product.product', {}).get('domain', [])
        fields = data.get('product.product', {}).get('fields', [])
        
        # Ensure stock fields are included
        if 'qty_available' not in fields:
            fields.append('qty_available')
        if 'type' not in fields:
            fields.append('type')
        
        products = self.search_read(domain, fields, load=False)
        
        # Get POS config to determine location
        pos_config = self.env['pos.config'].browse(data.get('pos.config.id'))
        location_id = pos_config.picking_type_id.default_location_src_id.id if pos_config else False
        
        # Add location-specific stock for each product
        if location_id:
            for product_data in products:
                product = self.browse(product_data['id'])
                product_data['pos_qty_available'] = product._get_stock_for_pos(location_id)
        
        return products
