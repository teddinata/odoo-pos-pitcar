# Panduan Instalasi POS Stock Display

## Persiapan

### 1. Backup Database
**PENTING:** Selalu backup database sebelum install module baru!

```bash
# Backup via Odoo CLI
odoo-bin -d database_name --stop-after-init --backup-db backup.zip

# Atau via Database Manager
https://your-odoo-url/web/database/manager
```

### 2. Copy Module ke Addons Directory

```bash
# Copy module
sudo cp -r pos_stock_display /opt/odoo/addons/custom/

# Set permissions
sudo chown -R odoo:odoo /opt/odoo/addons/custom/pos_stock_display
sudo chmod -R 755 /opt/odoo/addons/custom/pos_stock_display
```

### 3. Update Addons Path (jika belum)

Edit file konfigurasi Odoo:
```bash
sudo nano /etc/odoo.conf
```

Pastikan custom addons path sudah terdaftar:
```ini
[options]
addons_path = /opt/odoo/addons,/opt/odoo/addons/custom
```

## Instalasi

### Step 1: Restart Odoo Service

```bash
sudo systemctl restart odoo
# atau
sudo service odoo restart
```

### Step 2: Update Apps List

1. Login sebagai **Administrator**
2. Aktifkan **Developer Mode**:
   - Settings → Activate Developer Mode
3. Buka menu **Apps**
4. Klik **Update Apps List**
5. Klik **Update** pada dialog konfirmasi

### Step 3: Install Module

1. Di menu **Apps**, search: `POS Stock Display`
2. Klik **Install**
3. Tunggu hingga proses selesai (biasanya 10-30 detik)
4. Klik **Apply Schedule Upgrade** jika diminta

### Step 4: Restart POS Session

**PENTING:** Module baru akan aktif setelah POS session di-restart!

1. Tutup semua POS session yang sedang buka:
   - Point of Sale → Dashboard
   - Pilih session yang aktif
   - Klik **Close Session & Post Entries**

2. Buka POS session baru:
   - Point of Sale → New Session
   - Pilih POS config
   - Klik **Open Session**

3. Refresh browser atau hard refresh:
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

## Verifikasi Instalasi

### Cek 1: Module Status
```
Apps → Installed → Search "POS Stock Display"
Status harus: "Installed" dengan icon hijau
```

### Cek 2: Stock Badge Muncul
1. Buka POS interface
2. Lihat product cards
3. Badge stok harus muncul di pojok kanan atas
4. Warna badge sesuai level stok:
   - **Hijau**: Stok > 20
   - **Kuning**: Stok 10-20
   - **Merah**: Stok < 10
   - **Abu-abu**: Stok habis

### Cek 3: Warning Notification
1. Klik produk dengan stok rendah (< 10)
2. Warning kuning harus muncul
3. Klik produk habis stok
4. Warning merah harus muncul

### Cek 4: Browser Console
Buka Developer Tools (F12) → Console
Tidak boleh ada error merah terkait stock display

## Troubleshooting

### Problem 1: Module Tidak Muncul di Apps List

**Solusi:**
```bash
# Cek apakah module ada
ls -la /opt/odoo/addons/custom/pos_stock_display

# Cek permission
sudo chown -R odoo:odoo /opt/odoo/addons/custom/pos_stock_display

# Restart Odoo
sudo systemctl restart odoo

# Update Apps List lagi
```

### Problem 2: Stock Badge Tidak Muncul

**Solusi:**
1. **Hard refresh browser**: `Ctrl + Shift + R`
2. **Clear browser cache**: Settings → Clear browsing data
3. **Restart POS session**: Close dan buka baru
4. **Check product type**: Pastikan product = "Storable Product"
5. **Check Developer Console**: Lihat error di F12

### Problem 3: Error Saat Install

**Solusi:**
```bash
# Cek Odoo logs
sudo tail -f /var/log/odoo/odoo.log

# Jika ada error Python:
# 1. Cek syntax error di file .py
# 2. Restart Odoo service
# 3. Update module lagi

# Jika error dependency:
# Install missing modules dulu (point_of_sale, stock)
```

### Problem 4: Stock Tidak Akurat

**Solusi:**
1. **Check POS location**: 
   - Point of Sale → Configuration → Point of Sale
   - Pastikan "Operation Type" punya location yang benar

2. **Verify stock di Inventory**:
   - Inventory → Products
   - Check "Quantity On Hand" untuk location POS

3. **Refresh stock data**:
   - Close POS session
   - Buka session baru (reload stock data)

### Problem 5: Warning Tidak Muncul

**Solusi:**
1. **Check notification permission**:
   - Browser harus allow notifications
   - Settings → Site Settings → Notifications

2. **Cek browser console** (F12):
   - Lihat ada error di notification service
   - Check apakah onClick handler berjalan

3. **Test dengan product lain**:
   - Coba produk dengan stok < 10
   - Coba produk habis stok

## Uninstall Module (jika diperlukan)

### Step 1: Uninstall via Apps
1. Apps → Installed
2. Search "POS Stock Display"
3. Klik **Uninstall**
4. Confirm

### Step 2: Remove Files (optional)
```bash
sudo rm -rf /opt/odoo/addons/custom/pos_stock_display
sudo systemctl restart odoo
```

## Update Module

Jika ada versi baru:

```bash
# 1. Backup database
# 2. Replace module files
sudo rm -rf /opt/odoo/addons/custom/pos_stock_display
sudo cp -r pos_stock_display /opt/odoo/addons/custom/

# 3. Set permissions
sudo chown -R odoo:odoo /opt/odoo/addons/custom/pos_stock_display

# 4. Restart Odoo
sudo systemctl restart odoo

# 5. Update module via Apps
# Apps → POS Stock Display → Upgrade
```

## Konfigurasi Custom

### Ubah Threshold Stok

Edit file: `static/src/js/models.js`

```javascript
get_stock_level() {
    const qty = this.get_stock_quantity();
    
    // Ubah nilai threshold di sini
    if (qty <= 0) return 'out';
    else if (qty < 5) return 'low';      // Ubah dari 10 ke 5
    else if (qty <= 15) return 'medium'; // Ubah dari 20 ke 15
    else return 'high';
}
```

Setelah edit:
```bash
# Restart Odoo
sudo systemctl restart odoo

# Update module
Apps → POS Stock Display → Upgrade
```

### Ubah Warna Badge

Edit file: `static/src/css/pos_stock.css`

```css
.stock-high { 
    background-color: #28a745; /* Ubah warna hijau */
}
```

Setelah edit, hard refresh browser: `Ctrl + Shift + R`

## Support

Jika masih ada masalah:

1. **Check logs**: `sudo tail -f /var/log/odoo/odoo.log`
2. **Developer Console**: F12 di browser
3. **Contact support**: support@pitcar.co.id

## Best Practices

✅ Selalu backup sebelum install
✅ Test di staging environment dulu
✅ Install saat jam tidak sibuk
✅ Close semua POS session sebelum install
✅ Inform kasir untuk restart POS setelah install
✅ Monitor logs setelah install
✅ Test semua fitur POS setelah install

## Checklist Post-Installation

- [ ] Module status = "Installed"
- [ ] Stock badge muncul di product cards
- [ ] Warna badge sesuai threshold
- [ ] Warning notification bekerja
- [ ] Tidak ada error di browser console
- [ ] Tidak ada error di Odoo logs
- [ ] POS transaction masih berjalan normal
- [ ] Stock calculation akurat
- [ ] User/kasir sudah di-brief tentang fitur baru
