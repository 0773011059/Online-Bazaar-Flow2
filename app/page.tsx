'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in by making a simple API call
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(true);
          setUserRole(data.role);
        }
      } catch (error) {
        console.log('[v0] Not logged in');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setIsLoggedIn(false);
      setUserRole(null);
      router.push('/');
    } catch (error) {
      console.error('[v0] Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground">بارگذاری...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">بازار آنلاین</div>
          <nav className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                {userRole === 'customer' && (
                  <Link href="/customer">
                    <Button variant="outline">داشبورد خریدار</Button>
                  </Link>
                )}
                {userRole === 'delivery' && (
                  <Link href="/delivery">
                    <Button variant="outline">داشبورد پیک</Button>
                  </Link>
                )}
                {userRole === 'admin' && (
                  <Link href="/admin">
                    <Button variant="outline">داشبورد مدیر</Button>
                  </Link>
                )}
                <Button variant="ghost" onClick={handleLogout}>
                  خروج
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">ورود</Button>
                </Link>
                <Link href="/register">
                  <Button>ثبت‌نام</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-5xl font-bold text-foreground mb-4">
          خوش آمدید به بازار آنلاین
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          بهترین محصولات را با قیمت مناسب سفارش دهید
        </p>

        {!isLoggedIn && (
          <div className="flex gap-4 justify-center">
            <Link href="/register?role=customer">
              <Button size="lg" className="bg-primary text-primary-foreground">
                شروع خرید
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                ورود
              </Button>
            </Link>
          </div>
        )}

        {isLoggedIn && userRole === 'customer' && (
          <Link href="/customer">
            <Button size="lg" className="bg-primary text-primary-foreground">
              مرحله بعدی
            </Button>
          </Link>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            چرا ما را انتخاب کنید؟
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-secondary">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-xl font-bold mb-2">محصولات متنوع</h3>
              <p className="text-muted-foreground">
                انواع مختلف محصولات از لبنیات تا میوه و سبزیجات
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-secondary">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">تحویل سریع</h3>
              <p className="text-muted-foreground">
                پیک‌های آموزش‌دیده و قابل اعتماد برای تحویل سریع
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-secondary">
              <div className="text-4xl mb-4">✓</div>
              <h3 className="text-xl font-bold mb-2">کیفیت تضمین‌شده</h3>
              <p className="text-muted-foreground">
                تمام محصولات اسکن بارکد شده و اصل تضمین‌شده
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
