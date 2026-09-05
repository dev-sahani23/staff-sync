import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth, type Role } from '../components/AuthContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const loginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(5, { message: "Password must be at least 5 characters long." }),
});

export function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof loginSchema>) => {
        setIsLoading(true);
        // Simulate network request
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Mock role derivation from email for testing scenarios
        let assignedRole: Role = 'Employee';
        if (values.email.includes('admin')) assignedRole = 'Admin';
        else if (values.email.includes('hrmanager')) assignedRole = 'HR Manager';
        else if (values.email.includes('hrpayrolluser')) assignedRole = 'HR Payroll User';
        else if (values.email.includes('hrpayrollmanager')) assignedRole = 'HR Payroll Manager';

        // Call context login
        login('mock-jwt-token-xyz-789', {
            employeeId: 'EMP-001',
            name: values.email.split('@')[0].toLowerCase(),
            role: assignedRole,
        });

        setIsLoading(false);
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* Top Header */}
            <div className="w-full bg-[#f8f9fc] rounded-b-xl border-b border-gray-200 px-6 py-5 shadow-sm">
                <h1 className="text-xl text-slate-800">HR Portal</h1>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex justify-center items-start pt-16 md:pt-24 px-4 font-sans">
                <div className="w-full max-w-[440px] space-y-8">
                    <div>
                        <h2 className="text-3xl font-medium text-slate-800 tracking-tight">Welcome back</h2>
                        <p className="mt-2 text-[#64748b] text-base">Sign in to continue to your workspace.</p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-sm font-medium text-[#475569]">Work Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="name@company.com" className="h-12 rounded-xl text-base border-[#cbd5e1] focus-visible:ring-1 focus-visible:ring-blue-500" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5 pt-1">
                                        <FormLabel className="text-sm font-medium text-[#475569]">Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" className="h-12 rounded-xl text-lg tracking-widest border-[#cbd5e1] focus-visible:ring-1 focus-visible:ring-blue-500" {...field} />
                                        </FormControl>
                                        <div className="flex justify-end pt-1">
                                            <a href="#" className="text-sm text-[#2563eb] hover:text-blue-500">Forgot password?</a>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="pt-2">
                                <Button type="submit" className="w-full h-12 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-base font-medium shadow-none transition-colors" disabled={isLoading}>
                                    {isLoading ? 'Signing In...' : 'Sign In'}
                                </Button>
                            </div>
                        </form>
                    </Form>

                    <div className="pt-8 mt-8 border-t border-gray-100">
                        <p className="text-center text-sm text-[#64748b]">
                            Accounts are created by an administrator.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
