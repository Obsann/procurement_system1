import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

import { users } from '../mockData';
import type { UserRole } from '../types';

export function LoginPage({ onLogin }: { onLogin: (role: UserRole) => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('marcus@procuresync.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const user = users.find(u => u.email === email);
      if (user) {
        onLogin(user.role);
        navigate('/dashboard');
      } else {
        setError('Invalid credentials. Try: marcus@procuresync.com');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-deep grid-pattern relative">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-indigo/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-violet/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md px-6 animate-fadeIn">
        <div className="bg-bg-surface rounded-xl border border-border-default shadow-xl p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-accent-indigo flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-accent-indigo/30">PS</div>
            <span className="text-2xl font-bold text-text-primary">ProcureSync</span>
          </div>

          <h1 className="text-xl font-semibold text-text-primary text-center mb-2">Sign in to your account</h1>
          <p className="text-sm text-text-muted text-center mb-8">Enter your credentials to access the platform</p>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm flex items-center gap-2">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-bg-input border border-border-default text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo/30 transition-all"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-bg-input border border-border-default text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo/30 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-accent-indigo hover:bg-accent-indigo-hover text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-accent-indigo/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/forgot-password" className="text-sm text-accent-indigo hover:text-accent-violet transition-colors">Forgot password?</a>
          </div>

          {/* Demo hint */}
          <div className="mt-8 pt-6 border-t border-border-default">
            <p className="text-xs text-text-muted text-center mb-3">Quick demo access (click to fill):</p>
            <div className="grid grid-cols-3 gap-2">
              {users.slice(0, 6).map(u => (
                <button key={u.id} className="px-2 py-2 rounded-lg bg-bg-surface-hover border border-border-default text-xs text-text-secondary hover:text-text-primary hover:border-accent-indigo/30 transition-all" onClick={() => setEmail(u.email)}>
                  {u.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-text-muted text-center mt-6">© 2024 ProcureSync. Enterprise procurement management.</p>
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setSent(true); setLoading(false); }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-deep grid-pattern relative">
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-accent-indigo/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-accent-violet/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md px-6 animate-fadeIn">
        <div className="bg-bg-surface rounded-xl border border-border-default shadow-xl p-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent-indigo flex items-center justify-center text-white font-bold shadow-lg shadow-accent-indigo/30">PS</div>
          </div>

          {sent ? (
            <div className="text-center animate-fadeIn">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
                <Mail className="w-8 h-8 text-success" />
              </div>
              <h1 className="text-xl font-semibold text-text-primary mb-2">Reset link sent</h1>
              <p className="text-sm text-text-muted mb-6">We've sent a password reset link to <span className="text-text-secondary">{email}</span>. Check your inbox.</p>
              <button onClick={() => navigate('/')} className="w-full py-3 rounded-lg bg-accent-indigo hover:bg-accent-indigo-hover text-white font-semibold text-sm transition-all">
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-text-primary text-center mb-2">Forgot password?</h1>
              <p className="text-sm text-text-muted text-center mb-8">Enter your email to receive a reset link</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text-secondary">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-bg-input border border-border-default text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo/30 transition-all"
                      placeholder="name@company.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-accent-indigo hover:bg-accent-indigo-hover text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <a href="/" className="text-sm text-accent-indigo hover:text-accent-violet transition-colors">← Back to Sign In</a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
