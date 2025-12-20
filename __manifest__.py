# -*- coding: utf-8 -*-
{
    'name': 'Pitcar POS',
    'version': '16.0.1.0.0',
    'category': 'Point of Sale',
    'summary': 'Display product stock quantity in POS interface',
    'description': """
Show real-time stock availability in POS product cards.

Features:
- Color-coded stock levels (Green: >20, Yellow: 10-20, Red: <10)
- Warning notification for low stock items
- Visual stock indicators on product cards
    """,
    'author': 'Pitcar Development Team',
    'website': 'https://www.pitcar.co.id',
    'depends': [
        'point_of_sale',
        'stock',
    ],
    'data': [
        'views/assets.xml',
    ],
    'assets': {
        'point_of_sale.assets': [
            'pos_stock_display/static/src/css/pos_stock.css',
            'pos_stock_display/static/src/js/models.js',
            'pos_stock_display/static/src/js/ProductScreen.js',
        ],
    },
    'installable': True,
    'application': True,
    'auto_install': False,
    'license': 'LGPL-3',
}