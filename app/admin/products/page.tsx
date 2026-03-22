'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
  is_available: boolean;
  category_id: number;
  category_name?: string;
}

interface Category {
  id: number;
  name: string;
}

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock_quantity: '',
    category_id: '',
    description: '',
    barcode: '',
    is_available: true
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setFormData({
          name: '',
          price: '',
          stock_quantity: '',
          category_id: '',
          description: '',
          barcode: '',
          is_available: true
        });
        setShowForm(false);
        fetchProducts();
      }
    } catch (err) {
      console.error('Failed to add product:', err);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('آیا مطمئن هستید؟')) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/admin" className="text-primary hover:underline mb-4 inline-block">
            ← بازگشت
          </Link>
          <h1 className="text-3xl font-bold text-foreground">مدیریت محصولات</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
        >
          {showForm ? 'لغو' : '+ افزودن محصول جدید'}
        </button>

        {showForm && (
          <div className="bg-card rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">محصول جدید</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">نام محصول</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full p-2 border border-border rounded bg-input text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">قیمت</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="w-full p-2 border border-border rounded bg-input text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">موجودی</label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    required
                    className="w-full p-2 border border-border rounded bg-input text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">دسته‌بندی</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  required
                  className="w-full p-2 border border-border rounded bg-input text-foreground"
                >
                  <option value="">انتخاب دسته‌بندی</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">توضیح</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border border-border rounded bg-input text-foreground"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">بارکد (اختیاری)</label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="w-full p-2 border border-border rounded bg-input text-foreground"
                />
              </div>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-foreground">در دسترس است</span>
              </label>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
              >
                افزودن محصول
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-foreground">در حال بارگذاری...</p>
        ) : (
          <div className="bg-card rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="p-4 text-right text-foreground font-semibold">نام</th>
                  <th className="p-4 text-right text-foreground font-semibold">قیمت</th>
                  <th className="p-4 text-right text-foreground font-semibold">موجودی</th>
                  <th className="p-4 text-right text-foreground font-semibold">وضعیت</th>
                  <th className="p-4 text-right text-foreground font-semibold">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-border hover:bg-secondary/20">
                    <td className="p-4 text-foreground">{product.name}</td>
                    <td className="p-4 text-foreground">{product.price.toLocaleString()} ریال</td>
                    <td className="p-4 text-foreground">{product.stock_quantity}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        product.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.is_available ? 'در دسترس' : 'ناموجود'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-destructive hover:underline text-sm"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
