'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  totalDeliveryStaff: number;
  totalProducts: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const userData = await res.json();
        if (userData.role !== 'admin') {
          router.push('/login');
        }
        setUser(userData);
      } else {
        router.push('/login');
      }
    } catch (err) {
      router.push('/login');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (!user) {
    return <div className="text-center p-8">در حال بررسی...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">پنل مدیریت</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90"
          >
            خروج
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-card rounded-lg shadow p-6">
              <p className="text-muted-foreground text-sm">کل سفارشات</p>
              <p className="text-3xl font-bold text-primary">{stats.totalOrders}</p>
            </div>
            <div className="bg-card rounded-lg shadow p-6">
              <p className="text-muted-foreground text-sm">سفارشات در انتظار</p>
              <p className="text-3xl font-bold text-accent">{stats.pendingOrders}</p>
            </div>
            <div className="bg-card rounded-lg shadow p-6">
              <p className="text-muted-foreground text-sm">مشتریان</p>
              <p className="text-3xl font-bold text-primary">{stats.totalCustomers}</p>
            </div>
            <div className="bg-card rounded-lg shadow p-6">
              <p className="text-muted-foreground text-sm">پیک‌ها</p>
              <p className="text-3xl font-bold text-primary">{stats.totalDeliveryStaff}</p>
            </div>
            <div className="bg-card rounded-lg shadow p-6">
              <p className="text-muted-foreground text-sm">محصولات</p>
              <p className="text-3xl font-bold text-primary">{stats.totalProducts}</p>
            </div>
          </div>
        )}

        {/* Management Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/products"
            className="bg-card rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-foreground mb-2">مدیریت محصولات</h2>
            <p className="text-muted-foreground mb-4">افزودن، ویرایش و حذف محصولات</p>
            <span className="text-primary font-medium">رفتن →</span>
          </Link>

          <Link
            href="/admin/categories"
            className="bg-card rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-foreground mb-2">مدیریت دسته‌بندی‌ها</h2>
            <p className="text-muted-foreground mb-4">مدیریت دسته‌های محصولات</p>
            <span className="text-primary font-medium">رفتن →</span>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-card rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-foreground mb-2">مدیریت سفارشات</h2>
            <p className="text-muted-foreground mb-4">تایید و پیگیری سفارشات</p>
            <span className="text-primary font-medium">رفتن →</span>
          </Link>

          <Link
            href="/admin/delivery-staff"
            className="bg-card rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-foreground mb-2">مدیریت پیک‌ها</h2>
            <p className="text-muted-foreground mb-4">ثبت و مدیریت پیک‌ها</p>
            <span className="text-primary font-medium">رفتن →</span>
          </Link>

          <Link
            href="/admin/users"
            className="bg-card rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-foreground mb-2">مدیریت کاربران</h2>
            <p className="text-muted-foreground mb-4">مشاهده و مدیریت کاربران</p>
            <span className="text-primary font-medium">رفتن →</span>
          </Link>

          <Link
            href="/customer"
            className="bg-card rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-foreground mb-2">بازگشت به فروشگاه</h2>
            <p className="text-muted-foreground mb-4">مشاهده فروشگاه به عنوان مشتری</p>
            <span className="text-primary font-medium">رفتن →</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
