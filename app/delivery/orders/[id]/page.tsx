'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Camera, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  barcode: string;
  quantity: number;
  price: number;
  scanned: boolean;
}

interface Order {
  id: string;
  status: 'pending' | 'confirmed' | 'delivered';
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  items: OrderItem[];
}

export default function DeliveryOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usCamera, setUseCamera] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  async function fetchOrder() {
    try {
      setLoading(true);
      const res = await fetch(`/api/delivery/orders/${orderId}`);
      if (!res.ok) throw new Error('Failed to fetch order');
      const data = await res.json();
      setOrder(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading order');
    } finally {
      setLoading(false);
    }
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);

        // Continuous scanning
        const interval = setInterval(() => {
          if (canvasRef.current && videoRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              ctx.drawImage(
                videoRef.current,
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height
              );
              
              // Here you would integrate a barcode library like jsbarcode
              // For now, we'll use manual input
            }
          }
        }, 100);

        return () => clearInterval(interval);
      }
    } catch (err) {
      setError('Unable to access camera');
    }
  }

  function stopCamera() {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      setCameraActive(false);
    }
  }

  async function handleBarcodeScanned(barcode: string) {
    if (!order) return;

    try {
      // Find the item with this barcode
      const item = order.items.find((i) => i.barcode === barcode);

      if (!item) {
        setError('بارکد مطابقت ندارد!');
        setTimeout(() => setError(''), 3000);
        return;
      }

      // Mark as scanned
      const updatedItems = order.items.map((i) =>
        i.id === item.id ? { ...i, scanned: true } : i
      );

      setOrder({ ...order, items: updatedItems });
      setBarcodeInput('');

      // Check if all items are scanned
      const allScanned = updatedItems.every((i) => i.scanned);
      if (allScanned) {
        handleCompleteOrder();
      }
    } catch (err) {
      setError('Error processing barcode');
    }
  }

  async function handleCompleteOrder() {
    try {
      const res = await fetch(`/api/delivery/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'delivered' }),
      });

      if (!res.ok) throw new Error('Failed to complete order');

      // Stop camera and redirect
      stopCamera();
      router.push('/delivery');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error completing order');
    }
  }

  async function handleSkipItem(itemId: string) {
    if (!order) return;

    const updatedItems = order.items.map((i) =>
      i.id === itemId ? { ...i, scanned: true } : i
    );

    setOrder({ ...order, items: updatedItems });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">بارگذاری...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">سفارش پیدا نشد</div>
      </div>
    );
  }

  const scannedCount = order.items.filter((i) => i.scanned).length;
  const totalCount = order.items.length;
  const progress = (scannedCount / totalCount) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/delivery">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">
              سفارش #{orderId.slice(0, 8)}
            </h1>
            <p className="text-sm text-muted-foreground">
              {order.customer_name} • {order.customer_phone}
            </p>
          </div>
          <Badge>
            {scannedCount} / {totalCount} محصول اسکن شد
          </Badge>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">پیشرفت اسکن</p>
            <p className="text-sm text-muted-foreground">{Math.round(progress)}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Camera Section */}
        {cameraActive ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>دوربین اسکن</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg bg-black"
                  style={{ aspectRatio: '4/3' }}
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                  width={640}
                  height={480}
                />
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="w-full"
                >
                  بستن دوربین
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>روش اسکن</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  onClick={startCamera}
                  variant={usCamera ? 'default' : 'outline'}
                  className="flex-1 gap-2"
                >
                  <Camera className="w-4 h-4" />
                  استفاده از دوربین
                </Button>
                <Button
                  onClick={() => setUseCamera(false)}
                  variant={!usCamera ? 'default' : 'outline'}
                  className="flex-1"
                >
                  ورود دستی
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Barcode Input */}
        {!cameraActive && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>ورود بارکد</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="بارکد را اسکن کنید یا تایپ کنید..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleBarcodeScanned(barcodeInput);
                    }
                  }}
                  autoFocus
                />
                <Button
                  onClick={() => handleBarcodeScanned(barcodeInput)}
                  variant="default"
                >
                  تایید
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>محصولات سفارش</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-lg p-4 flex items-center justify-between ${
                    item.scanned ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {item.product_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      بارکد: {item.barcode}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      تعداد: {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.scanned ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-yellow-600" />
                    )}
                    {!item.scanned && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSkipItem(item.id)}
                      >
                        رد شدن
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>اطلاعات مشتری</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <p className="text-sm text-muted-foreground">نام</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تلفن</p>
                <p className="font-medium">{order.customer_phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">آدرس</p>
                <p className="font-medium">{order.customer_address}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">مبلغ سفارش</p>
                <p className="font-medium text-lg">
                  {order.total_amount.toLocaleString('fa-IR')} تومان
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complete Button */}
        {scannedCount === totalCount && (
          <Button
            onClick={handleCompleteOrder}
            className="w-full mt-8 py-6 text-lg"
          >
            تکمیل تحویل
          </Button>
        )}
      </main>
    </div>
  );
}
