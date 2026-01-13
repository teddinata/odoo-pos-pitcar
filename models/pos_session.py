# -*- coding: utf-8 -*-

from odoo import models, api


class PosSession(models.Model):
    _inherit = 'pos.session'

    def _pos_ui_models_to_load(self):
        """Add product.tag to models loaded in POS"""
        result = super()._pos_ui_models_to_load()
        if 'product.tag' in self.env:
            result.append('product.tag')
        return result

    def _loader_params_product_tag(self):
        """Define what fields to load for product tags"""
        return {
            'search_params': {
                'domain': [],
                'fields': ['name', 'color'],
            },
        }

    def _get_pos_ui_product_tag(self, params):
        """Load product tags data"""
        if 'product.tag' in self.env:
            tags = self.env['product.tag'].search_read(**params['search_params'])
            print(f"DEBUG: Loaded {len(tags)} tags: {tags}")  # ← Add this
            return tags
        print("DEBUG: product.tag model not found")  # ← Add this
        return []

    def _loader_params_product_product(self):
        """Add stock-related fields to product loader"""
        result = super()._loader_params_product_product()
        
        if 'qty_available' not in result['search_params']['fields']:
            result['search_params']['fields'].append('qty_available')
        if 'type' not in result['search_params']['fields']:
            result['search_params']['fields'].append('type')
        if 'product_tmpl_id' not in result['search_params']['fields']:
            result['search_params']['fields'].append('product_tmpl_id')
        
        return result

    def _pos_data_process(self, loaded_data):
        """Process loaded data to add stock and tags"""
        super()._pos_data_process(loaded_data)
        
        location_id = self.config_id.picking_type_id.default_location_src_id.id
        
        if not location_id or 'product.product' not in loaded_data:
            return
        
        # Collect template IDs
        template_ids = set()
        for product_data in loaded_data.get('product.product', []):
            tmpl_id = product_data.get('product_tmpl_id')
            if tmpl_id:
                if isinstance(tmpl_id, (list, tuple)):
                    template_ids.add(tmpl_id[0])
                else:
                    template_ids.add(tmpl_id)
        
        # Fetch tags for all templates
        template_tags = {}
        if template_ids:
            try:
                templates_data = self.env['product.template'].search_read(
                    [('id', 'in', list(template_ids))],
                    ['id', 'product_tag_ids']
                )
                
                for tmpl in templates_data:
                    template_tags[tmpl['id']] = tmpl.get('product_tag_ids', [])
                    
            except Exception:
                pass
        
        # Process each product
        for product_data in loaded_data.get('product.product', []):
            try:
                product = self.env['product.product'].browse(product_data['id'])
                
                # Add stock
                if product.type == 'product':
                    product_with_location = product.with_context(location=location_id)
                    product_data['pos_qty_available'] = product_with_location.qty_available or 0.0
                else:
                    product_data['pos_qty_available'] = 0.0
                
                # Add tags
                tmpl_id = product_data.get('product_tmpl_id')
                if isinstance(tmpl_id, (list, tuple)):
                    tmpl_id = tmpl_id[0]
                
                product_data['tag_ids'] = template_tags.get(tmpl_id, [])
                    
            except Exception:
                product_data['pos_qty_available'] = 0.0
                product_data['tag_ids'] = []
        
        # ===== ADD THIS NEW SECTION =====
        # Make sure tag data is accessible via pos.tags
        # Map tag_by_id for easy lookup in JavaScript
        if 'product.tag' in loaded_data and loaded_data['product.tag']:
            # Store in a way JavaScript can access
            tag_by_id = {}
            for tag in loaded_data['product.tag']:
                tag_by_id[tag['id']] = tag
            
            # This will be accessible as pos.tags in JavaScript
            if 'product.tag' not in loaded_data:
                loaded_data['product.tag'] = []