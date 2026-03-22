-- Insert sample categories
INSERT INTO categories (name, description) VALUES
  ('لبنیات', 'محصولات لبنی و پنیر'),
  ('نوشیدنی', 'آب‌میوه و نوشابه'),
  ('غذا', 'محصولات غذایی مختلف'),
  ('میوه', 'میوه‌های تازه'),
  ('سبزیجات', 'سبزیجات تازه')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, price, quantity, category_id, barcode, description, is_available) VALUES
  -- لبنیات
  ('شیر پاستوریزه 1 لیتری', 15000, 100, (SELECT id FROM categories WHERE name = 'لبنیات'), 'MILK001', 'شیر تازه پاستوریزه', true),
  ('ماست چربی 400 گرم', 12000, 80, (SELECT id FROM categories WHERE name = 'لبنیات'), 'YOGI001', 'ماست طبیعی چربی دار', true),
  ('پنیر سفید 500 گرم', 35000, 50, (SELECT id FROM categories WHERE name = 'لبنیات'), 'CHEESE001', 'پنیر سفید صنعتی', true),
  
  -- نوشیدنی
  ('کوکا کولا 1.5 لیتری', 18000, 120, (SELECT id FROM categories WHERE name = 'نوشیدنی'), 'COKE001', 'نوشابه کوکا کولا', true),
  ('آب میوه پرتقال 1 لیتری', 22000, 90, (SELECT id FROM categories WHERE name = 'نوشیدنی'), 'OJ001', 'آب میوه پرتقال تازه', true),
  ('چای سیاه 500 گرم', 25000, 60, (SELECT id FROM categories WHERE name = 'نوشیدنی'), 'TEA001', 'چای سیاه خوی', true),
  
  -- غذا
  ('برنج هاشمی 1 کیلو', 28000, 200, (SELECT id FROM categories WHERE name = 'غذا'), 'RICE001', 'برنج ایرانی هاشمی', true),
  ('روغن کانولا 1 لیتری', 35000, 80, (SELECT id FROM categories WHERE name = 'غذا'), 'OIL001', 'روغن سرخ‌پختی', true),
  ('نان سفید 400 گرم', 8000, 300, (SELECT id FROM categories WHERE name = 'غذا'), 'BREAD001', 'نان سفید تازه', true),
  
  -- میوه
  ('سیب قرمز 1 کیلو', 20000, 150, (SELECT id FROM categories WHERE name = 'میوه'), 'APPLE001', 'سیب قرمز تازه', true),
  ('موز 1 کیلو', 18000, 120, (SELECT id FROM categories WHERE name = 'میوه'), 'BANANA001', 'موز تازه و رسیده', true),
  ('نارنجی 1 کیلو', 19000, 100, (SELECT id FROM categories WHERE name = 'میوه'), 'ORANGE001', 'نارنجی شیرین', true),
  
  -- سبزیجات
  ('گوجه‌فرنگی 1 کیلو', 16000, 180, (SELECT id FROM categories WHERE name = 'سبزیجات'), 'TOMATO001', 'گوجه‌فرنگی تازه', true),
  ('خیار 1 کیلو', 14000, 150, (SELECT id FROM categories WHERE name = 'سبزیجات'), 'CUCUMBER001', 'خیار تازه', true),
  ('پیاز سفید 1 کیلو', 12000, 200, (SELECT id FROM categories WHERE name = 'سبزیجات'), 'ONION001', 'پیاز سفید خوب', true);
