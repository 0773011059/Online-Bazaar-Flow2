'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trash2, Plus, CheckCircle, XCircle } from 'lucide-react';

interface DeliveryStaff {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  card_number: string;
  is_active: boolean;
  created_at: string;
}

export default function DeliveryStaffPage() {
  const [staff, setStaff] = useState<DeliveryStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    card_number: '',
    password: '',
  });

  useEffect(() => {
    fetchDeliveryStaff();
  }, []);

  async function fetchDeliveryStaff() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/delivery-staff');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setStaff(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading staff');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: 'delivery',
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Registration failed');
      }

      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        card_number: '',
        password: '',
      });
      setShowForm(false);
      await fetchDeliveryStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding staff');
    }
  }

  async function handleDeleteStaff(id: string) {
    if (!confirm('آیا مطمئن هستید؟')) return;

    try {
      const res = await fetch(`/api/admin/delivery-staff/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');
      await fetchDeliveryStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting staff');
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">مدیریت پیک‌ها</h1>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            افزودن پیک جدید
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg">
            {error}
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>ثبت پیک جدید</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddStaff} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="نام"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="نام خانوادگی"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    required
                  />
                </div>
                <Input
                  type="email"
                  placeholder="ایمیل"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
                <Input
                  placeholder="شماره تماس"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
                <Input
                  placeholder="شماره کارت شناسایی"
                  value={formData.card_number}
                  onChange={(e) =>
                    setFormData({ ...formData, card_number: e.target.value })
                  }
                  required
                />
                <Input
                  type="password"
                  placeholder="رمز عبور"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit">ثبت پیک</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    لغو
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Staff List */}
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-12">بارگذاری...</div>
          ) : staff.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              پیکی ثبت نشده است
            </div>
          ) : (
            staff.map((member) => (
              <Card key={member.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {member.first_name} {member.last_name}
                        </h3>
                        {member.is_active ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>ایمیل: {member.email}</p>
                        <p>تلفن: {member.phone}</p>
                        <p>شماره کارت: {member.card_number}</p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteStaff(member.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
