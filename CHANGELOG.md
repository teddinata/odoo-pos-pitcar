# Changelog

## [16.0.1.0.0] - 2024-12-20

### Added
- Initial release of POS Stock Display module
- Real-time stock quantity display on POS product cards
- Color-coded stock levels (Green: >20, Yellow: 10-20, Red: <10, Grey: 0)
- Stock badge positioned at top-right corner of product card
- Warning notifications for low stock and out of stock items
- Visual overlay for out of stock products
- Safe implementation with comprehensive error handling
- Support for location-specific stock calculation
- Automatic stock data loading when POS session starts

### Features
- Display stock only for storable products (type='product')
- Pulsing animation for low/out of stock warnings
- Responsive design for mobile POS
- No blocking - warnings only, transactions can proceed
- Formatted stock text with proper number rounding

### Technical
- Extends `product.product` model for stock data
- Extends `pos.session` for data loading
- Patches `Product` prototype with stock methods
- Patches `ProductCard` component with stock display
- Clean separation of concerns (Models/Views/Controllers)
- Proper asset management via manifest
- LGPL-3 License

### Safety
- Try-catch blocks in all critical methods
- Fallback values for missing data
- Type checking before method calls
- Error logging to console
- Graceful degradation if errors occur
