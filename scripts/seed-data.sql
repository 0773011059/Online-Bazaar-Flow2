-- Insert sample categories
INSERT INTO categories (name, description) VALUES
  ('لبنیات', 'محصولات لبنی و پنیر'),
  ('نوشیدنی', 'آب‌میوه و نوشابه'),
  ('غذا', 'محصولات غذایی مختلف'),
  ('میوه', 'میوه‌های تازه'),
  ('سبزیجات', 'سبزیجات تازه')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO products (category_id, name, description, price, stock_quantity, barcode, is_available) VALUES
  -- لبنیات
  ((SELECT id FROM categories WHERE name = 'لبنیات'), 'شیر پاستوریزه 1 لیتری', 'شیر تازه پاستوریزه', 15000, 100, 'MILK001', true),
  ((SELECT id FROM categories WHERE name = 'لبنیات'), 'ماست چربی 400 گرم', 'ماست طبیعی چربی دار', 12000, 80, 'YOGI001', true),
  ((SELECT id FROM categories WHERE name = 'لبنیات'), 'پنیر سفید 500 گرم', 'پنیر سفید صنعتی', 35000, 50, 'CHEESE001', true),
  
  -- نوشیدنی
  ((SELECT id FROM categories WHERE name = 'نوشیدنی'), 'کوکا کولا 1.5 لیتری', 'نوشابه کوکا کولا', 18000, 120, 'COKE001', true),
  ((SELECT id FROM categories WHERE name = 'نوشیدنی'), 'آب میوه پرتقال 1 لیتری', 'آب میوه پرتقال تازه', 22000, 90, 'OJ001', true),
  ((SELECT id FROM categories WHERE name = 'نوشیدنی'), 'چای سیاه 500 گرم', 'چای سیاه خوی', 25000, 60, 'TEA001', true),
  
  -- غذا
  ((SELECT id FROM categories WHERE name = 'غذا'), 'برنج هاشمی 1 کیلو', 'برنج ایرانی هاشمی', 28000, 200, 'RICE001', true),
  ((SELECT id FROM categories WHERE name = 'غذا'), 'روغن کانولا 1 لیتری', 'روغن سرخ‌پختی', 35000, 80, 'OIL001', true),
  ((SELECT id FROM categories WHERE name = 'غذا'), 'نان سفید 400 گرم', 'نان سفید تازه', 8000, 300, 'BREAD001', true),
  
  -- میوه
  ((SELECT id FROM categories WHERE name = 'میوه'), 'سیب قرمز 1 کیلو', 'سیب قرمز تازه', 20000, 150, 'APPLE001', true),
  ((SELECT id FROM categories WHERE name = 'میوه'), 'موز 1 کیلو', 'موز تازه و رسیده', 18000, 120, 'BANANA001', true),
  ((SELECT id FROM categories WHERE name = 'میوه'), 'نارنجی 1 کیلو', 'نارنجی شیرین', 19000, 100, 'ORANGE001', true),
  
  -- سبزیجات
  ((SELECT id FROM categories WHERE name = 'سبزیجات'), 'گوجه‌فرنگی 1 کیلو', 'گوجه‌فرنگی تازه', 16000, 180, 'TOMATO001', true),
  ((SELECT id FROM categories WHERE name = 'سبزیجات'), 'خیار 1 کیلو', 'خیار تازه', 14000, 150, 'CUCUMBER001', true),
  ((SELECT id FROM categories WHERE name = 'سبزیجات'), 'پیاز سفید 1 کیلو', 'پیاز سفید خوب', 12000, 200, 'ONION001', true);
