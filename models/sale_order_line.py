# -*- coding: utf-8 -*-

from odoo import models, fields, api
import logging

_logger = logging.getLogger(__name__)


class SaleOrderLine(models.Model):
    _inherit = 'sale.order.line'

    # Override margin and margin_percent with markup calculation
    margin = fields.Float(
        'Margin',
        compute='_compute_margin',
        store=True,
        help='Margin Amount: Sales Price - Cost'
    )
    
    margin_percent = fields.Float(
        'Margin (%)',
        compute='_compute_margin',
        store=True,
        help='Markup on Cost: (Sales Price - Cost) / Cost × 100'
    )

    @api.depends('price_unit', 'purchase_price', 'product_uom_qty')
    def _compute_margin(self):
        """
        Override margin calculation to use Markup on Cost formula
        
        Formula: ((Price - Cost) / Cost) × 100
        
        This calculates the markup percentage based on cost, which is
        more intuitive for pricing decisions in automotive/spare parts business.
        """
        for line in self:
            # Get cost price
            cost = line.purchase_price or line.product_id.standard_price or 0.0
            price = line.price_unit
            
            # Calculate margin amount
            margin_amount = price - cost
            line.margin = margin_amount
            
            # Calculate markup percentage
            if cost > 0:
                markup_percent = (margin_amount / cost) * 100
                line.margin_percent = markup_percent
                
                _logger.debug(
                    f"Order Line {line.id}: Product={line.product_id.name}, "
                    f"Cost={cost}, Price={price}, Markup={markup_percent:.2f}%"
                )
            else:
                line.margin_percent = 0.0
                _logger.debug(
                    f"Order Line {line.id}: Cost is zero, markup set to 0%"
                )


class SaleOrder(models.Model):
    _inherit = 'sale.order'

    margin_percent = fields.Float(
        'Margin (%)',
        compute='_compute_margin',
        store=True,
        help='Total Markup on Cost: (Total Price - Total Cost) / Total Cost × 100'
    )

    @api.depends('order_line.margin', 'order_line.purchase_price', 'amount_untaxed')
    def _compute_margin(self):
        """
        Override sale order margin to use Markup on Cost formula
        
        Calculates total markup based on total cost vs total price
        """
        for order in self:
            # Calculate total margin amount
            total_margin = sum(order.order_line.mapped('margin'))
            order.margin = total_margin
            
            # Calculate total cost
            total_cost = sum([
                (line.purchase_price or line.product_id.standard_price or 0.0) * line.product_uom_qty
                for line in order.order_line
            ])
            
            # Calculate markup percentage
            if total_cost > 0:
                markup_percent = (total_margin / total_cost) * 100
                order.margin_percent = markup_percent
                
                _logger.info(
                    f"Order {order.name}: Total Cost={total_cost:.2f}, "
                    f"Total Price={order.amount_untaxed:.2f}, "
                    f"Total Margin={total_margin:.2f}, "
                    f"Markup={markup_percent:.2f}%"
                )
            else:
                order.margin_percent = 0.0