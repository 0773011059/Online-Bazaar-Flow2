'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CartItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
}

interface DeliveryStaff {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [deliveryStaff, setDeliveryStaff] = useState<DeliveryStaff[]>([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<number | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(5000);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load cart from localStorage
    const cart = localStorage.getItem('cart');
    if (cart) {
      setCartItems(JSON.parse(cart));
    }

    // Fetch delivery staff
    fetchDeliveryStaff();
  }, []);

  const fetchDeliveryStaff = async () => {
    try {
      const res = await fetch('/api/delivery-staff');
      if (res.ok) {
        const data = await res.json();
        setDeliveryStaff(data);
      }
    } catch (err) {
      console.error('Failed to fetch delivery staff:', err);
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalTotal = totalPrice + deliveryFee;

  const handleSubmitOrder = async () => {
    if (!selectedDeliveryId) {
      setError('لطفاً یک پیک انتخاب کنید');
      return;
    }
    if (!address || !phone) {
      setError('لطفاً آدرس و شماره تماس را وارد کنید');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          delivery_staff_id: selectedDeliveryId,
          delivery_fee: deliveryFee,
          notes,
          address,
          phone_number: phone
        })
      });

      if (res.ok) {
        localStorage.removeItem('cart');
        router.push('/customer/orders');
      } else {
        const data = await res.json();
        setError(data.error || 'خطا در ثبت سفارش');
      }
    } catch (err) {
      setError('خطا در ثبت سفارش');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">سبد خریدتان خالی است</h1>
          <Link href="/customer" className="text-primary hover:underline">
            ← بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">تکمیل سفارش</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Summary */}
            <div className="bg-card rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">محصولات سفارش</h2>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.product_id} className="flex justify-between items-center pb-4 border-b border-border">
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        تعداد: {item.quantity} × {item.price.toLocaleString()} ریال
                      </p>
                    </div>
                    <p className="font-semibold text-primary">
                      {(item.price * item.quantity).toLocaleString()} ریال
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Staff Selection */}
            <div className="bg-card rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">انتخاب پیک</h2>
              {deliveryStaff.length === 0 ? (
                <p className="text-muted-foreground">هیچ پیکی در دسترس نیست</p>
              ) : (
                <div className="space-y-2">
                  {deliveryStaff.map((staff) => (
                    <label key={staff.id} className="flex items-center p-3 border border-border rounded-lg hover:bg-secondary cursor-pointer">
                      <input
                        type="radio"
                        name="delivery"
                        checked={selectedDeliveryId === staff.id}
                        onChange={() => setSelectedDeliveryId(staff.id)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {staff.first_name} {staff.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{staff.phone_number}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Address and Phone */}
            <div className="bg-card rounded-lg shadow-md p-6 space-y-4">
              <h2 className="text-xl font-semibold text-foreground">اطلاعات تحویل</h2>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">آدرس</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="آدرس مکمل تحویل"
                  className="w-full p-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">شماره تماس</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09xxxxxxxxx"
                  className="w-full p-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">یادداشت (اختیاری)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="توضیحات اضافی برای پیک"
                  className="w-full p-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-foreground mb-4">خلاصه سفارش</h2>
              <div className="space-y-3 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between text-foreground">
                  <span>جمع محصولات:</span>
                  <span>{totalPrice.toLocaleString()} ریال</span>
                </div>
                <div className="flex justify-between text-foreground">
                  <span>هزینه تحویل:</span>
                  <span>{deliveryFee.toLocaleString()} ریال</span>
                </div>
              </div>
              <div className="flex justify-between text-lg font-bold text-primary mb-6">
                <span>جمع کل:</span>
                <span>{finalTotal.toLocaleString()} ریال</span>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmitOrder}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'در حال ثبت...' : 'تایید و ثبت سفارش'}
              </button>

              <Link
                href="/customer"
                className="block text-center mt-3 text-primary hover:underline text-sm"
              >
                بازگشت به فروشگاه
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
