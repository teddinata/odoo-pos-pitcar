# POS Stock Display Module

## Overview
Module untuk menampilkan stok produk real-time di interface Point of Sale Odoo 16.

## Features
✅ Tampilan stok real-time di product card POS
✅ Color-coded stock levels:
   - **Hijau** (>20 unit): Stok aman
   - **Kuning** (10-20 unit): Stok menengah
   - **Merah** (<10 unit): Stok rendah
   - **Abu-abu** (0 unit): Habis stok
✅ Warning notification saat memilih produk low/out of stock
✅ Visual overlay untuk produk habis stok
✅ Support untuk semua product types (storable/service/consumable)

## Technical Details
- **Version**: 16.0.1.0.0
- **Odoo Version**: 16.0
- **Dependencies**: point_of_sale, stock
- **License**: LGPL-3

## Installation

### 1. Copy Module
```bash
cp -r pos_stock_display /path/to/odoo/addons/
```

### 2. Update Apps List
- Login sebagai Administrator
- Pergi ke **Apps** menu
- Klik **Update Apps List**
- Search "POS Stock Display"

### 3. Install Module
- Klik **Install** pada module "POS Stock Display"
- Tunggu hingga installation selesai

### 4. Restart POS Session
- Close semua POS session yang aktif
- Buka POS session baru
- Stock badge akan muncul di product cards

## Usage

### Product Card Display
Setelah module terinstall, setiap product card akan menampilkan:
- **Badge stok** di pojok kanan atas
- **Warna badge** sesuai level stok
- **Text** menunjukkan jumlah stok atau "Habis"

### Notifications
Saat memilih produk:
- **Low stock** (< 10): Warning kuning dengan info stok tersisa
- **Out of stock** (0): Warning merah bahwa produk habis
- Tetap bisa melanjutkan transaksi (warning only, tidak blocking)

### Stock Calculation
- Stock dihitung berdasarkan **location POS** (picking type location)
- Update real-time saat POS session dimulai
- Hanya untuk **storable products** (type='product')

## Configuration

### Stock Thresholds
Default thresholds (bisa disesuaikan di code):
```javascript
// File: static/src/js/models.js
get_stock_level() {
    const qty = this.get_stock_quantity();
    
    if (qty <= 0) return 'out';        // Habis
    else if (qty < 10) return 'low';   // Rendah (merah)
    else if (qty <= 20) return 'medium'; // Menengah (kuning)
    else return 'high';                // Tinggi (hijau)
}
```

### Customize Colors
Edit file: `static/src/css/pos_stock.css`
```css
.stock-high { background-color: #28a745; }    /* Hijau */
.stock-medium { background-color: #ffc107; }  /* Kuning */
.stock-low { background-color: #dc3545; }     /* Merah */
.stock-out { background-color: #6c757d; }     /* Abu-abu */
```

## Troubleshooting

### Stock Tidak Muncul
1. **Check product type**: Pastikan product type = "Storable Product"
2. **Restart POS session**: Close dan buka kembali POS
3. **Check browser console**: Lihat error di Developer Tools
4. **Clear browser cache**: Shift + Ctrl + R untuk hard refresh

### Stock Tidak Akurat
1. **Check POS location**: Pastikan POS config punya location yang benar
2. **Verify stock**: Cek stock di Inventory → Products
3. **Location mismatch**: Stock dihitung per location POS

### Warning Tidak Muncul
1. **Check notification service**: Pastikan tidak ada error di console
2. **Browser permission**: Allow notifications jika diminta
3. **Theme compatibility**: Test dengan theme default Odoo

## File Structure
```
pos_stock_display/
├── __init__.py                          # Main module init
├── __manifest__.py                      # Module manifest
├── models/
│   ├── __init__.py
│   ├── product_product.py              # Product model extension
│   └── pos_session.py                  # POS session data loader
├── static/src/
│   ├── css/
│   │   └── pos_stock.css               # Stock badge styling
│   ├── js/
│   │   ├── models.js                   # Product model methods
│   │   └── ProductCard.js              # ProductCard component
│   └── xml/
│       └── ProductCard.xml             # ProductCard template
└── views/
    └── assets.xml                       # Asset registration
```

## Safety Features
- ✅ Proper error handling di semua methods
- ✅ Fallback values jika data tidak tersedia
- ✅ Try-catch blocks untuk prevent crashes
- ✅ Type checking sebelum method calls
- ✅ Default return values untuk safety

## Compatibility
- ✅ Tested dengan Odoo 16.0
- ✅ Compatible dengan custom themes
- ✅ Works dengan multi-location setup
- ✅ Support untuk semua product types

## Support
Untuk bantuan atau bug report:
- Email: support@pitcar.co.id
- Website: https://www.pitcar.co.id

## License
LGPL-3

## Credits
Developed by Pitcar Development Team
Maintainers: Ahmad Husein Hambali, Teddinata Kusuma
