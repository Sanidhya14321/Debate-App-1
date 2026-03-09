'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { AlertCircle, Shield, Eye, EyeOff } from 'lucide-react';
import { apiFetch } from '../../../lib/apiFetch';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleAutoFill = () => {
    setCredentials({
      email: 'admin@example.com',
      password: 'adminpassword'
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (data?.role !== 'admin') {
        setError('This account does not have admin access.');
        return;
      }

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify({ email: credentials.email, role: data.role }));
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('Admin login error:', error);
      setError('Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-10" />
      
      <Card className="w-full max-w-md skeuo-gloss">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto p-3 rounded-full skeuo-inset w-fit">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Admin Access
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your administrator credentials to access the dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
              </Label>
              <Input
                  id="email"
                  name="email"
                  type="email"
                  value={credentials.email}
                onChange={handleInputChange}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-ring/50 focus:ring-ring/30"
                  placeholder="Enter admin email"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={handleInputChange}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-ring/50 focus:ring-ring/30 pr-10"
                  placeholder="Enter admin password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:opacity-90 text-primary-foreground font-semibold py-2.5 transition-all duration-200"
              disabled={loading || !credentials.email || !credentials.password}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Authenticating...
                </div>
              ) : (
                'Access Dashboard'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground text-center">
                Demo Credentials for Testing:
              </p>
              <div className="skeuo-inset rounded-lg p-3 space-y-2 border border-border cursor-pointer transition-colors" onClick={handleAutoFill}>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Username:</span>
                  <code className="text-primary bg-background px-2 py-1 rounded text-xs">admin@example.com</code>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Password:</span>
                  <code className="text-primary bg-background px-2 py-1 rounded text-xs">adminpassword</code>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Click credentials to auto-fill the form
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;