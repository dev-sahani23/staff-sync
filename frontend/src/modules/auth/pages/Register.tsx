import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const registerSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(5, { message: "Password must be at least 5 characters long." }),
});

export function Register() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof registerSchema>) => {
        setIsLoading(true);
        try {
            const { api } = await import('@/api/api');
            // 1. Register the user
            await api.post('/auth/register', {
                email: values.email,
                password: values.password,
                role: 'EMPLOYEE', // Default role
            });
            
            // 2. Automatically log them in after registration
            const loginResponse = await api.post('/auth/login', {
                email: values.email,
                password: values.password
            });
            
            const { accessToken, user } = loginResponse.data;
            
            // Call context login
            login(accessToken, {
                employeeId: user.employeeId || '',
                name: user.email.split('@')[0].toLowerCase(),
                role: user.role,
            });

            // Role-based redirect: employees → own profile, HR+ → dashboard
            if (user.role === 'EMPLOYEE' && user.employeeId) {
                navigate(`/employee/${user.employeeId}`);
            } else {
                navigate('/dashboard');
            }
        } catch (error: any) {
            console.error("Registration failed:", error);
            const errMsg = error.response?.data?.message || "Registration failed. Please try again.";
            alert(errMsg);
        } finally {
            setIsLoading(false);
        }
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
                        <h2 className="text-3xl font-medium text-slate-800 tracking-tight">Create an account</h2>
                        <p className="mt-2 text-[#64748b] text-base">Join the workspace to manage your HR profile.</p>
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="pt-2">
                                <Button type="submit" className="w-full h-12 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-base font-medium shadow-none transition-colors" disabled={isLoading}>
                                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                                </Button>
                            </div>
                        </form>
                    </Form>

                    <div className="pt-8 mt-8 border-t border-gray-100">
                        <p className="text-center text-sm text-[#64748b]">
                            Already have an account? <Link to="/login" className="text-[#2563eb] hover:text-blue-500 font-medium">Log in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
