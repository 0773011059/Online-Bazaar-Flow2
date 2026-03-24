'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setUsers(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading users');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser(id: string) {
    if (!confirm('آیا مطمئن هستید؟')) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting user');
    }
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      customer: 'مشتری',
      delivery: 'پیک',
      admin: 'ادمین',
    };
    return labels[role] || role;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">مدیریت کاربران</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg">
            {error}
          </div>
        )}

        {/* Users List */}
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-12">بارگذاری...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              کاربری ثبت نشده است
            </div>
          ) : (
            users.map((user) => (
              <Card key={user.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {user.first_name} {user.last_name}
                        </h3>
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          {getRoleLabel(user.role)}
                        </span>
                        {user.is_active ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>ایمیل: {user.email}</p>
                        <p>تاریخ ثبت: {new Date(user.created_at).toLocaleDateString('fa-IR')}</p>
                      </div>
                    </div>
                    {user.role !== 'admin' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        حذف
                      </Button>
                    )}
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
