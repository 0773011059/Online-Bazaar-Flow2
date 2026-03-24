'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Package, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  status: 'pending' | 'confirmed' | 'delivered';
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  items_count: number;
  delivery_staff_id?: string;
  created_at: string;
}

interface DeliveryStats {
  pending: number;
  confirmed: number;
  delivered: number;
}

export default function DeliveryDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DeliveryStats>({
    pending: 0,
    confirmed: 0,
    delivered: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchDeliveryData();
  }, []);

  async function fetchDeliveryData() {
    try {
      setLoading(true);
      
      // Get current user
      const userRes = await fetch('/api/auth/me');
      if (userRes.ok) {
        const userData = await userRes.json();
        setUserName(`${userData.user.first_name} ${userData.user.last_name}`);
      }

      // Get assigned orders
      const ordersRes = await fetch('/api/delivery/orders');
      if (!ordersRes.ok) throw new Error('Failed to fetch orders');
      const ordersData = await ordersRes.json();

      setOrders(ordersData.data || []);

      // Calculate stats
      const newStats = {
        pending: (ordersData.data || []).filter((o: Order) => o.status === 'pending').length,
        confirmed: (ordersData.data || []).filter((o: Order) => o.status === 'confirmed').length,
        delivered: (ordersData.data || []).filter((o: Order) => o.status === 'delivered').length,
      };
      setStats(newStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      setError('Logout failed');
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'در انتظار تایید';
      case 'confirmed':
        return 'تایید شده';
      case 'delivered':
        return 'تحویل شده';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">داشبورد پیک</h1>
            <p className="text-muted-foreground text-sm">خوش آمدید، {userName}</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">سفارش‌های در انتظار</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats.pending}</p>
                </div>
                <Clock className="w-10 h-10 text-yellow-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">سفارش‌های تایید شده</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats.confirmed}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">سفارش‌های تحویل شده</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats.delivered}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>سفارش‌های من</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">بارگذاری...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                هیچ سفارشی برای تحویل وجود ندارد
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/delivery/orders/${order.id}`}
                  >
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-primary" />
                          <div>
                            <h3 className="font-semibold text-foreground">
                              سفارش #{order.id.slice(0, 8)}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {order.customer_name}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">آدرس</p>
                          <p className="font-medium truncate">{order.customer_address}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">تلفن</p>
                          <p className="font-medium">{order.customer_phone}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">تعداد محصول</p>
                          <p className="font-medium">{order.items_count}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">هزینه</p>
                          <p className="font-medium">{order.total_amount.toLocaleString('fa-IR')} تومان</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
