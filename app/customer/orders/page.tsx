'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface OrderItem {
  id: number;
  product_id: number;
  name: string;
  quantity: number;
  price_at_time: number;
  barcode: string;
  scanned_at: string | null;
}

interface Order {
  id: number;
  status: string;
  total_price: number;
  delivery_fee: number;
  created_at: string;
  first_name: string;
  last_name: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">سفارشات من</h1>
          <Link href="/customer" className="text-primary hover:underline">
            بازگشت
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-card rounded-lg shadow-md p-8 text-center">
            <p className="text-muted-foreground mb-4">هنوز هیچ سفارشی ثبت نشده است</p>
            <Link href="/customer" className="text-primary hover:underline">
              شروع خرید
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-card rounded-lg shadow-md overflow-hidden">
                <div
                  className="p-6 cursor-pointer hover:bg-secondary/50 transition"
                  onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        سفارش #{order.id}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {(order.total_price + order.delivery_fee).toLocaleString()} ریال
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedOrder === order.id && (
                  <div className="border-t border-border p-6 bg-secondary/20">
                    <h4 className="font-semibold text-foreground mb-4">محصولات:</h4>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-foreground">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} × {item.price_at_time.toLocaleString()} ریال
                              {item.scanned_at && (
                                <span className="ml-2 text-green-600">✓ اسکن شده</span>
                              )}
                            </p>
                          </div>
                          <p className="font-semibold text-foreground">
                            {(item.quantity * item.price_at_time).toLocaleString()} ریال
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-border space-y-2">
                      <div className="flex justify-between text-foreground">
                        <span>جمع محصولات:</span>
                        <span>{order.total_price.toLocaleString()} ریال</span>
                      </div>
                      <div className="flex justify-between text-foreground">
                        <span>هزینه تحویل:</span>
                        <span>{order.delivery_fee.toLocaleString()} ریال</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-primary">
                        <span>جمع کل:</span>
                        <span>{(order.total_price + order.delivery_fee).toLocaleString()} ریال</span>
                      </div>
                    </div>

                    {order.first_name && (
                      <div className="mt-4 p-3 bg-background rounded">
                        <p className="text-sm text-muted-foreground">پیک:</p>
                        <p className="font-medium text-foreground">
                          {order.first_name} {order.last_name}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
