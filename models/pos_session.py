# -*- coding: utf-8 -*-

from odoo import models, api


class PosSession(models.Model):
    _inherit = 'pos.session'

    def _loader_params_product_product(self):
        """
        Add stock-related fields to product loader parameters
        This ensures stock data is loaded when POS session starts
        """
        result = super()._loader_params_product_product()
        
        # Add stock fields to ensure they're loaded
        if 'qty_available' not in result['search_params']['fields']:
            result['search_params']['fields'].append('qty_available')
        if 'type' not in result['search_params']['fields']:
            result['search_params']['fields'].append('type')
        
        return result

    def _pos_data_process(self, loaded_data):
        """
        Process loaded data to add location-specific stock
        Safe method with proper error handling
        """
        super()._pos_data_process(loaded_data)
        
        # Get POS location for stock calculation
        location_id = self.config_id.picking_type_id.default_location_src_id.id
        
        if not location_id or 'product.product' not in loaded_data:
            return
        
        # Add stock info to each product
        for product_data in loaded_data.get('product.product', []):
            try:
                product = self.env['product.product'].browse(product_data['id'])
                
                # Only add stock for storable products
                if product.type == 'product':
                    product_with_location = product.with_context(location=location_id)
                    product_data['pos_qty_available'] = product_with_location.qty_available or 0.0
                else:
                    product_data['pos_qty_available'] = 0.0
                    
            except Exception:
                # If any error, set stock to 0
                product_data['pos_qty_available'] = 0.0
