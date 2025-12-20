#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
POS Stock Display Module Validation Script
Checks module structure and file integrity before installation
"""

import os
import sys
from pathlib import Path

def validate_module():
    """Validate module structure and required files"""
    
    module_path = Path(__file__).parent
    errors = []
    warnings = []
    
    print("=" * 60)
    print("POS Stock Display - Module Validation")
    print("=" * 60)
    
    # Required files
    required_files = [
        '__init__.py',
        '__manifest__.py',
        'models/__init__.py',
        'models/product_product.py',
        'models/pos_session.py',
        'static/src/css/pos_stock.css',
        'static/src/js/models.js',
        'static/src/js/ProductCard.js',
        'static/src/xml/ProductCard.xml',
        'views/assets.xml',
    ]
    
    print("\n1. Checking Required Files...")
    for file_path in required_files:
        full_path = module_path / file_path
        if full_path.exists():
            print(f"   ✓ {file_path}")
        else:
            errors.append(f"Missing required file: {file_path}")
            print(f"   ✗ {file_path} - MISSING!")
    
    # Check __manifest__.py content
    print("\n2. Validating __manifest__.py...")
    manifest_path = module_path / '__manifest__.py'
    if manifest_path.exists():
        try:
            with open(manifest_path, 'r') as f:
                content = f.read()
                
            # Check critical keys
            critical_keys = ['name', 'version', 'depends', 'assets']
            for key in critical_keys:
                if f"'{key}'" in content or f'"{key}"' in content:
                    print(f"   ✓ Key '{key}' found")
                else:
                    errors.append(f"Missing key in manifest: {key}")
                    print(f"   ✗ Key '{key}' - MISSING!")
            
            # Check dependencies
            if "'point_of_sale'" in content and "'stock'" in content:
                print("   ✓ Required dependencies declared")
            else:
                errors.append("Missing required dependencies")
                print("   ✗ Dependencies incomplete!")
                
        except Exception as e:
            errors.append(f"Error reading manifest: {str(e)}")
            print(f"   ✗ Error reading manifest: {e}")
    
    # Check Python syntax
    print("\n3. Checking Python Syntax...")
    python_files = [
        'models/product_product.py',
        'models/pos_session.py',
    ]
    
    for py_file in python_files:
        file_path = module_path / py_file
        if file_path.exists():
            try:
                with open(file_path, 'r') as f:
                    compile(f.read(), py_file, 'exec')
                print(f"   ✓ {py_file} - Syntax OK")
            except SyntaxError as e:
                errors.append(f"Syntax error in {py_file}: {str(e)}")
                print(f"   ✗ {py_file} - SYNTAX ERROR: {e}")
        else:
            print(f"   - {py_file} - Not found (already reported)")
    
    # Check XML files
    print("\n4. Checking XML Files...")
    xml_files = [
        'static/src/xml/ProductCard.xml',
        'views/assets.xml',
    ]
    
    for xml_file in xml_files:
        file_path = module_path / xml_file
        if file_path.exists():
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                if '<?xml' in content:
                    print(f"   ✓ {xml_file} - Valid XML structure")
                else:
                    warnings.append(f"{xml_file} missing XML declaration")
                    print(f"   ! {xml_file} - Missing XML declaration")
            except Exception as e:
                errors.append(f"Error reading {xml_file}: {str(e)}")
                print(f"   ✗ {xml_file} - ERROR: {e}")
        else:
            print(f"   - {xml_file} - Not found (already reported)")
    
    # Check JavaScript files
    print("\n5. Checking JavaScript Files...")
    js_files = [
        'static/src/js/models.js',
        'static/src/js/ProductCard.js',
    ]
    
    for js_file in js_files:
        file_path = module_path / js_file
        if file_path.exists():
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                if '/** @odoo-module */' in content:
                    print(f"   ✓ {js_file} - Odoo module format")
                else:
                    warnings.append(f"{js_file} missing @odoo-module declaration")
                    print(f"   ! {js_file} - Missing @odoo-module")
            except Exception as e:
                errors.append(f"Error reading {js_file}: {str(e)}")
                print(f"   ✗ {js_file} - ERROR: {e}")
        else:
            print(f"   - {js_file} - Not found (already reported)")
    
    # Summary
    print("\n" + "=" * 60)
    print("VALIDATION SUMMARY")
    print("=" * 60)
    
    if not errors and not warnings:
        print("✓ All checks passed! Module is ready for installation.")
        return 0
    
    if warnings:
        print(f"\n⚠ Warnings ({len(warnings)}):")
        for warning in warnings:
            print(f"  - {warning}")
    
    if errors:
        print(f"\n✗ Errors ({len(errors)}):")
        for error in errors:
            print(f"  - {error}")
        print("\nModule validation FAILED! Please fix errors before installation.")
        return 1
    
    print("\n⚠ Module has warnings but can be installed.")
    return 0


if __name__ == '__main__':
    sys.exit(validate_module())
