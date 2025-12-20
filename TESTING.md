# Testing Guide - POS Stock Display

## Pre-Installation Testing

### 1. Module Structure Test
```bash
cd pos_stock_display
python3 validate_module.py
```

Expected output: "✓ All checks passed! Module is ready for installation."

### 2. Python Syntax Test
```bash
# Test all Python files
python3 -m py_compile models/product_product.py
python3 -m py_compile models/pos_session.py

# No output = success
```

### 3. File Permissions Test
```bash
# Check read permissions
find . -type f ! -perm -644 -ls

# Should be empty or all files readable
```

## Post-Installation Testing

### Test Case 1: Module Installation
**Objective**: Verify module installs without errors

**Steps:**
1. Update Apps List
2. Search "POS Stock Display"
3. Click Install
4. Wait for completion

**Expected Result:**
- ✅ Installation completes without errors
- ✅ Module appears in Installed Apps
- ✅ No errors in odoo.log

**Validation:**
```bash
# Check logs for errors
sudo tail -100 /var/log/odoo/odoo.log | grep -i error
```

---

### Test Case 2: Stock Badge Display - High Stock
**Objective**: Verify green badge for high stock items

**Precondition:**
- Product with qty > 20
- Product type = Storable Product

**Steps:**
1. Open POS session
2. Navigate to products view
3. Find product with high stock

**Expected Result:**
- ✅ Green badge appears in top-right corner
- ✅ Text shows "Stok: [quantity]"
- ✅ Badge color = #28a745 (green)

**Screenshot Location:** Test evidence should show green badge

---

### Test Case 3: Stock Badge Display - Medium Stock
**Objective**: Verify yellow badge for medium stock items

**Precondition:**
- Product with qty between 10-20
- Product type = Storable Product

**Steps:**
1. Create/adjust product with qty = 15
2. Open POS session
3. Find the product

**Expected Result:**
- ✅ Yellow badge appears
- ✅ Text shows "Stok: 15"
- ✅ Badge color = #ffc107 (yellow)

---

### Test Case 4: Stock Badge Display - Low Stock
**Objective**: Verify red badge for low stock items

**Precondition:**
- Product with qty < 10 (but > 0)
- Product type = Storable Product

**Steps:**
1. Create/adjust product with qty = 5
2. Open POS session
3. Find the product

**Expected Result:**
- ✅ Red badge appears
- ✅ Text shows "Stok: 5"
- ✅ Badge color = #dc3545 (red)
- ✅ Badge has pulsing animation

---

### Test Case 5: Stock Badge Display - Out of Stock
**Objective**: Verify grey badge and overlay for out of stock

**Precondition:**
- Product with qty = 0
- Product type = Storable Product

**Steps:**
1. Create/adjust product with qty = 0
2. Open POS session
3. Find the product

**Expected Result:**
- ✅ Grey badge appears
- ✅ Text shows "Habis"
- ✅ Badge color = #6c757d (grey)
- ✅ Product card has semi-transparent overlay
- ✅ Badge has pulsing animation

---

### Test Case 6: Warning Notification - Low Stock
**Objective**: Verify warning when selecting low stock item

**Precondition:**
- Product with qty < 10 (e.g., qty = 5)

**Steps:**
1. Open POS
2. Click product with low stock

**Expected Result:**
- ✅ Yellow warning notification appears
- ✅ Message: "Peringatan: Stok [product name] tinggal 5 unit"
- ✅ Notification duration: ~3 seconds
- ✅ Product still added to cart

---

### Test Case 7: Warning Notification - Out of Stock
**Objective**: Verify warning when selecting out of stock item

**Precondition:**
- Product with qty = 0

**Steps:**
1. Open POS
2. Click product with zero stock

**Expected Result:**
- ✅ Warning notification appears
- ✅ Message: "Peringatan: [product name] sedang habis stok"
- ✅ Notification duration: ~4 seconds
- ✅ Product still added to cart (warning only, no blocking)

---

### Test Case 8: Service/Consumable Products
**Objective**: Verify no stock badge for non-storable products

**Precondition:**
- Product with type = Service or Consumable

**Steps:**
1. Open POS
2. Find service/consumable product

**Expected Result:**
- ✅ No stock badge appears
- ✅ Product card looks normal
- ✅ No stock-related warnings

---

### Test Case 9: Location-Specific Stock
**Objective**: Verify stock calculated from correct location

**Precondition:**
- POS config with specific picking type/location
- Product with different stock in different locations

**Steps:**
1. Check product stock in multiple locations
2. Note POS location stock
3. Open POS session
4. Compare displayed stock

**Expected Result:**
- ✅ Displayed stock matches POS location stock
- ✅ Stock from other locations ignored

**Validation Query:**
```python
# In Odoo shell
product = env['product.product'].browse(PRODUCT_ID)
location = env['pos.config'].browse(CONFIG_ID).picking_type_id.default_location_src_id
stock = product.with_context(location=location.id).qty_available
print(f"Stock in POS location: {stock}")
```

---

### Test Case 10: Session Restart Stock Update
**Objective**: Verify stock updates when session restarted

**Precondition:**
- Active POS session
- Product displayed in POS

**Steps:**
1. Note current displayed stock
2. Update stock in Inventory (add/remove)
3. Keep POS session open (don't refresh)
4. Close POS session
5. Open new POS session
6. Check product stock badge

**Expected Result:**
- ✅ Old session shows old stock (cache)
- ✅ New session shows updated stock
- ✅ Stock badge color updates if threshold crossed

---

### Test Case 11: Multiple Products Transaction
**Objective**: Verify stock warnings for multi-product orders

**Steps:**
1. Add high stock product → No warning
2. Add medium stock product → No warning
3. Add low stock product → Warning appears
4. Add out of stock product → Warning appears
5. Complete transaction

**Expected Result:**
- ✅ Only low/out stock products trigger warnings
- ✅ Each warning is distinct
- ✅ Transaction completes successfully

---

### Test Case 12: Browser Compatibility
**Objective**: Verify module works across browsers

**Browsers to Test:**
- Chrome/Chromium
- Firefox
- Safari (if available)
- Edge

**Steps:**
1. Open POS in each browser
2. Test all stock badge displays
3. Test warning notifications

**Expected Result:**
- ✅ Stock badges display correctly in all browsers
- ✅ Colors render consistently
- ✅ Notifications work in all browsers
- ✅ No console errors

---

### Test Case 13: Mobile/Responsive Display
**Objective**: Verify stock display on mobile/tablet

**Steps:**
1. Open POS on mobile/tablet device
2. Or use browser responsive mode (F12 → Toggle Device Toolbar)
3. Test various screen sizes:
   - Phone (375px)
   - Tablet (768px)
   - Desktop (1024px+)

**Expected Result:**
- ✅ Stock badge scales appropriately
- ✅ Text remains readable
- ✅ Badge position correct on all sizes
- ✅ Touch interaction works

---

### Test Case 14: Performance Test
**Objective**: Verify no performance degradation

**Steps:**
1. POS with 100+ products
2. Open POS session
3. Measure load time
4. Scroll through products
5. Search for products

**Expected Result:**
- ✅ Session load time < 5 seconds (normal range)
- ✅ Smooth scrolling (60fps)
- ✅ Search responsive
- ✅ No memory leaks (check Dev Tools)

**Performance Monitoring:**
```javascript
// In browser console
performance.measure('pos-load');
console.log(performance.getEntriesByType('measure'));
```

---

### Test Case 15: Error Handling
**Objective**: Verify graceful error handling

**Scenarios:**
1. **Missing stock data**: Product without qty_available
2. **Invalid product type**: Product.type = undefined
3. **Network error**: Slow/failed data loading

**Steps:**
1. Simulate each error condition
2. Open POS session
3. Interact with affected products

**Expected Result:**
- ✅ No JavaScript errors in console
- ✅ Module continues to function
- ✅ Fallback to default values (0 stock)
- ✅ User can still complete transactions

---

## Integration Testing

### Test Case 16: Existing POS Functionality
**Objective**: Verify module doesn't break existing POS features

**Test Areas:**
- ✅ Product search
- ✅ Product categories
- ✅ Add to cart
- ✅ Quantity adjustment
- ✅ Discounts
- ✅ Payment processing
- ✅ Receipt printing
- ✅ Session closing

**Expected Result:**
- All existing features work normally

---

### Test Case 17: Multi-Session Environment
**Objective**: Verify behavior with multiple POS sessions

**Steps:**
1. Open session in POS A
2. Open session in POS B
3. Sell product in POS A
4. Check stock in POS B (without refresh)
5. Close both sessions
6. Open new sessions

**Expected Result:**
- ✅ Each session shows stock at session start time
- ✅ Stock updates after session restart
- ✅ No conflicts between sessions

---

## Regression Testing

Run all test cases again after:
- Module updates
- Odoo upgrades
- Database migrations
- Custom modifications

## Test Data Setup

### Create Test Products

```python
# In Odoo shell or via UI
products = [
    {'name': 'TEST High Stock', 'type': 'product', 'qty': 50},
    {'name': 'TEST Medium Stock', 'type': 'product', 'qty': 15},
    {'name': 'TEST Low Stock', 'type': 'product', 'qty': 5},
    {'name': 'TEST Out Stock', 'type': 'product', 'qty': 0},
    {'name': 'TEST Service', 'type': 'service', 'qty': 0},
]
```

## Bug Reporting Template

```markdown
**Bug Title**: [Short description]

**Severity**: Critical / High / Medium / Low

**Environment**:
- Odoo Version: 16.0
- Module Version: 16.0.1.0.0
- Browser: [Name & Version]
- OS: [Operating System]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Screenshots**:
[Attach screenshots if applicable]

**Console Errors**:
```
[Paste console errors]
```

**Logs**:
```
[Paste relevant Odoo logs]
```
```

## Test Report Template

```markdown
# Test Report - POS Stock Display

**Date**: [Test Date]
**Tester**: [Tester Name]
**Environment**: [Test/Production]

## Summary
- Total Test Cases: 17
- Passed: [X]
- Failed: [Y]
- Blocked: [Z]

## Test Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| TC-01: Installation | ✅ Pass | - |
| TC-02: High Stock | ✅ Pass | - |
| TC-03: Medium Stock | ✅ Pass | - |
| TC-04: Low Stock | ✅ Pass | - |
| TC-05: Out of Stock | ✅ Pass | - |
| ... | ... | ... |

## Issues Found
[List any bugs or issues]

## Recommendations
[Suggestions for improvements]
```
