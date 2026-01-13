# -*- coding: utf-8 -*-

from odoo import models, fields, api
import logging

_logger = logging.getLogger(__name__)


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    # Override margin_percent with markup calculation
    margin_percent = fields.Float(
        'Margin (%)',
        compute='_compute_margin_percent',
        store=False,
        help='Markup on Cost: (Sales Price - Cost) / Cost × 100'
    )

    @api.depends('list_price', 'standard_price')
    def _compute_margin_percent(self):
        """
        Override margin calculation to use Markup on Cost formula
        
        Formula: ((Sales Price - Cost) / Cost) × 100
        
        Example:
            Cost: 100,000
            Sales: 150,000
            Markup: (150,000 - 100,000) / 100,000 × 100 = 50%
        """
        for product in self:
            if product.standard_price > 0:
                # Markup on Cost formula
                markup = ((product.list_price - product.standard_price) / product.standard_price) * 100
                product.margin_percent = markup
                _logger.debug(
                    f"Product {product.name}: Cost={product.standard_price}, "
                    f"Price={product.list_price}, Markup={markup:.2f}%"
                )
            else:
                product.margin_percent = 0.0
                _logger.debug(f"Product {product.name}: Cost is zero, markup set to 0%")