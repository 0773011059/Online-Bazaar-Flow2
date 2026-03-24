'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || 'customer';

  const [role, setRole] = useState(defaultRole);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Customer form
  const [customerForm, setCustomerForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
  });

  // Delivery form
  const [deliveryForm, setDeliveryForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    cardNumber: '',
  });

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...customerForm,
          role: 'customer',
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'خطا در ثبت‌نام');
        return;
      }

      // Auto login
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: customerForm.email,
          password: customerForm.password,
        }),
        credentials: 'include',
      });

      if (loginResponse.ok) {
        router.push('/customer');
      }
    } catch (err) {
      setError('خطای شبکه');
      console.error('[v0] Register error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...deliveryForm,
          role: 'delivery',
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'خطا در ثبت‌نام');
        return;
      }

      alert('ثبت‌نام با موفقیت انجام شد. منتظر تأیید ادمین باشید.');
      router.push('/login');
    } catch (err) {
      setError('خطای شبکه');
      console.error('[v0] Register error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>ثبت‌نام در بازار</CardTitle>
          <CardDescription>
            حساب خود را به عنوان خریدار یا پیک ایجاد کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={role} onValueChange={setRole} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customer">خریدار</TabsTrigger>
              <TabsTrigger value="delivery">پیک</TabsTrigger>
            </TabsList>

            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mt-4">
                {error}
              </div>
            )}

            {/* Customer Registration */}
            <TabsContent value="customer">
              <form onSubmit={handleCustomerSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>نام</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        placeholder="نام"
                        value={customerForm.firstName}
                        onChange={(e) =>
                          setCustomerForm({
                            ...customerForm,
                            firstName: e.target.value,
                          })
                        }
                        required
                      />
                    </InputGroup>
                  </Field>
                  <Field>
                    <FieldLabel>نام خانوادگی</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        placeholder="نام خانوادگی"
                        value={customerForm.lastName}
                        onChange={(e) =>
                          setCustomerForm({
                            ...customerForm,
                            lastName: e.target.value,
                          })
                        }
                      />
                    </InputGroup>
                  </Field>
                </div>

                <Field>
                  <FieldLabel>ایمیل</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      type="email"
                      placeholder="ایمیل"
                      value={customerForm.email}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </InputGroup>
                </Field>

                <Field>
                  <FieldLabel>شماره تماس</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      type="tel"
                      placeholder="شماره تماس"
                      value={customerForm.phone}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          phone: e.target.value,
                        })
                      }
                      required
                    />
                  </InputGroup>
                </Field>

                <Field>
                  <FieldLabel>آدرس</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      placeholder="آدرس کامل"
                      value={customerForm.address}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          address: e.target.value,
                        })
                      }
                      required
                    />
                  </InputGroup>
                </Field>

                <Field>
                  <FieldLabel>رمز عبور</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      type="password"
                      placeholder="رمز عبور"
                      value={customerForm.password}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                  </InputGroup>
                </Field>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground"
                  disabled={isLoading}
                >
                  {isLoading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
                </Button>
              </form>
            </TabsContent>

            {/* Delivery Registration */}
            <TabsContent value="delivery">
              <form onSubmit={handleDeliverySubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>نام</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        placeholder="نام"
                        value={deliveryForm.firstName}
                        onChange={(e) =>
                          setDeliveryForm({
                            ...deliveryForm,
                            firstName: e.target.value,
                          })
                        }
                        required
                      />
                    </InputGroup>
                  </Field>
                  <Field>
                    <FieldLabel>نام خانوادگی</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        placeholder="نام خانوادگی"
                        value={deliveryForm.lastName}
                        onChange={(e) =>
                          setDeliveryForm({
                            ...deliveryForm,
                            lastName: e.target.value,
                          })
                        }
                      />
                    </InputGroup>
                  </Field>
                </div>

                <Field>
                  <FieldLabel>ایمیل</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      type="email"
                      placeholder="ایمیل"
                      value={deliveryForm.email}
                      onChange={(e) =>
                        setDeliveryForm({
                          ...deliveryForm,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </InputGroup>
                </Field>

                <Field>
                  <FieldLabel>شماره کارت شناسایی</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      placeholder="شماره کارت"
                      value={deliveryForm.cardNumber}
                      onChange={(e) =>
                        setDeliveryForm({
                          ...deliveryForm,
                          cardNumber: e.target.value,
                        })
                      }
                      required
                    />
                  </InputGroup>
                </Field>

                <Field>
                  <FieldLabel>رمز عبور</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      type="password"
                      placeholder="رمز عبور"
                      value={deliveryForm.password}
                      onChange={(e) =>
                        setDeliveryForm({
                          ...deliveryForm,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                  </InputGroup>
                </Field>

                <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
                  بعد از ثبت‌نام، منتظر تأیید ادمین باشید.
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground"
                  disabled={isLoading}
                >
                  {isLoading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              قبلاً حساب دارید؟{' '}
              <Link href="/login" className="text-primary font-medium hover:underline">
                وارد شوید
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
