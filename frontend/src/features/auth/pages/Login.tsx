import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-store';
import { authApi } from '@/services/auth';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });
      login(response.accessToken, response.user);

      // Route by role per functional spec
      if (response.user.role === 'EMPLOYEE') {
        navigate(`/employees/${response.user.employeeId || ''}`);
      } else {
        navigate('/payroll');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="relative min-h-screen bg-[#F3F4F6] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
      {/* Background Decorative Geometric Shapes (Poster look, zero depth) */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-500/10 pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full bg-emerald-500/10 pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-72 h-72 rotate-12 bg-amber-500/10 pointer-events-none rounded-2xl" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="w-14 h-14 rounded-lg bg-[#3B82F6] text-white flex items-center justify-center font-extrabold text-2xl mx-auto shadow-none">
          HR
        </div>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#111827]">
          PeoplePay360
        </h2>
        <p className="mt-1 text-sm font-medium text-gray-500">
          Enterprise Human Resources & Integrated Payroll
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-lg shadow-none border-2 border-gray-100">
          {error && (
            <div className="mb-5 p-3.5 rounded-md bg-rose-100 text-xs font-semibold text-rose-800 flex items-center gap-2.5 shadow-none border-0">
              <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4 stroke-[2.2]" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full pl-10 pr-4 h-12 text-sm bg-[#F3F4F6] border-0 rounded-md text-[#111827] font-normal placeholder:text-gray-400 focus:bg-white focus:border-2 focus:border-[#3B82F6] focus:ring-0 outline-none transition-all duration-150"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Please contact your HR administrator to reset your password.');
                  }}
                  className="text-xs font-semibold text-[#3B82F6] hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4 stroke-[2.2]" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 h-12 text-sm bg-[#F3F4F6] border-0 rounded-md text-[#111827] font-normal placeholder:text-gray-400 focus:bg-white focus:border-2 focus:border-[#3B82F6] focus:ring-0 outline-none transition-all duration-150"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md shadow-none text-sm font-bold text-white bg-[#3B82F6] hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Cold-start loading indicator */}
            {isLoading && (
              <div className="mt-3 flex items-center gap-2 justify-center text-xs text-gray-500 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span>Connecting to server, this may take up to a minute on first load…</span>
              </div>
            )}
          </form>

          {/* Quick demo account filler buttons */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center mb-3">
              One-Click Demo Roles
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin@peoplepay.com')}
                className="py-2.5 px-2 text-xs font-bold bg-[#F3F4F6] hover:bg-blue-50 text-gray-800 hover:text-[#3B82F6] rounded-md transition-all duration-150 hover:scale-105 shadow-none border-0 text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('payroll.manager@peoplepay.com')}
                className="py-2.5 px-2 text-xs font-bold bg-[#F3F4F6] hover:bg-blue-50 text-gray-800 hover:text-[#3B82F6] rounded-md transition-all duration-150 hover:scale-105 shadow-none border-0 text-center"
              >
                Payroll Mgr
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('rahul.sharma@peoplepay.com')}
                className="py-2.5 px-2 text-xs font-bold bg-[#F3F4F6] hover:bg-blue-50 text-gray-800 hover:text-[#3B82F6] rounded-md transition-all duration-150 hover:scale-105 shadow-none border-0 text-center"
              >
                Employee
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
