'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Order {
  id: number;
  customer_id: number;
  full_name: string;
  phone_number: string;
  status: string;
  total_price: number;
  delivery_fee: number;
  created_at: string;
  delivery_staff_id: number | null;
  delivery_staff_name?: string;
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/admin/orders?status=${filterStatus}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Failed to update order:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'in_delivery':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'در انتظار تایید';
      case 'approved':
        return 'تایید شده';
      case 'in_delivery':
        return 'در حال تحویل';
      case 'completed':
        return 'تحویل داده شده';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/admin" className="text-primary hover:underline mb-4 inline-block">
            ← بازگشت
          </Link>
          <h1 className="text-3xl font-bold text-foreground">مدیریت سفارشات</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6">
          {['pending', 'approved', 'in_delivery', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded ${
                filterStatus === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-foreground border border-border'
              }`}
            >
              {getStatusLabel(status)}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-foreground">در حال بارگذاری...</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-card rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">سفارش #{order.id}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`px-3 py-1 rounded font-medium ${getStatusColor(order.status)}`}
                  >
                    <option value="pending">در انتظار تایید</option>
                    <option value="approved">تایید شده</option>
                    <option value="in_delivery">در حال تحویل</option>
                    <option value="completed">تحویل داده شده</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">مشتری</p>
                    <p className="font-medium text-foreground">{order.full_name}</p>
                    <p className="text-sm text-muted-foreground">{order.phone_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">مبلغ</p>
                    <p className="font-bold text-primary">
                      {(order.total_price + order.delivery_fee).toLocaleString()} ریال
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground">
                    هزینه تحویل: {order.delivery_fee.toLocaleString()} ریال
                  </p>
                </div>
              </div>
            ))}

            {orders.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">هیچ سفارشی یافت نشد</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
