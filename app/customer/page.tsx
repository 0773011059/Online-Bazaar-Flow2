'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Category {
  id: string;
  name: string;
  description: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category_id: string;
  category_name: string;
  barcode?: string;
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<(Product & { ordered_quantity: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Check auth and fetch categories
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authRes = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (!authRes.ok) {
          router.push('/login');
          return;
        }

        const authData = await authRes.json();
        if (authData.role !== 'customer') {
          router.push('/');
          return;
        }
        setUser(authData);

        // Fetch categories
        const catRes = await fetch('/api/categories', {
          credentials: 'include',
        });
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
          if (catData.length > 0) {
            setSelectedCategory(catData[0].id);
          }
        }
      } catch (error) {
        console.error('[v0] Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Fetch products when category changes
  useEffect(() => {
    if (!selectedCategory) return;

    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `/api/products?categoryId=${selectedCategory}`,
          { credentials: 'include' }
        );
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('[v0] Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, ordered_quantity: item.ordered_quantity + 1 }
            : item
        );
      }
      return [
        ...prevCart,
        {
          ...product,
          ordered_quantity: 1,
        },
      ];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prevCart) =>
        prevCart.filter((item) => item.id !== productId)
      );
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId
            ? { ...item, ordered_quantity: quantity }
            : item
        )
      );
    }
  };

  const getTotalPrice = () => {
    return cart.reduce(
      (total, item) => total + item.price * item.ordered_quantity,
      0
    );
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p>بارگذاری...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">بازار آنلاین - خریدار</h1>
          <div className="flex gap-4">
            <Link href="/customer/orders">
              <Button variant="outline">سفارش‌های من</Button>
            </Link>
            <form
              action={async () => {
                await fetch('/api/auth/logout', {
                  method: 'POST',
                  credentials: 'include',
                });
                router.push('/');
              }}
            >
              <Button variant="ghost" type="submit">
                خروج
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>دسته‌بندی‌ها</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-right p-2 rounded-md transition ${
                      selectedCategory === category.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Products Grid */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                {categories.find((c) => c.id === selectedCategory)?.name ||
                  'محصولات'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="pt-4">
                      <h3 className="font-bold mb-2">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        قیمت: {product.price.toLocaleString()} تومان
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        موجود: {product.quantity}
                      </p>
                      <Button
                        onClick={() => addToCart(product)}
                        className="w-full bg-primary text-primary-foreground"
                        disabled={product.quantity === 0}
                      >
                        {product.quantity === 0
                          ? 'ناموجود'
                          : 'افزودن به سبد'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>سبد خریدتان ({cart.length} محصول)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    سبد خریدتان خالی است
                  </p>
                ) : (
                  <>
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center pb-2 border-b"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(
                              item.price * item.ordered_quantity
                            ).toLocaleString()}{' '}
                            تومان
                          </p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.id,
                                item.ordered_quantity - 1
                              )
                            }
                            className="px-2 py-1 bg-secondary rounded"
                          >
                            -
                          </button>
                          <span className="w-6 text-center">
                            {item.ordered_quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.id,
                                item.ordered_quantity + 1
                              )
                            }
                            className="px-2 py-1 bg-secondary rounded"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold">کل:</span>
                        <span className="text-xl font-bold text-primary">
                          {getTotalPrice().toLocaleString()} تومان
                        </span>
                      </div>

                      <Link href="/customer/checkout">
                        <Button className="w-full bg-primary text-primary-foreground">
                          بررسی سفارش
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
