import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth, ROLE_LABELS } from '@/modules/auth/components/AuthContext';
import { usePermissions } from '@/modules/auth/components/ProtectedRoute';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

export function Layout() {
    const { user, logout } = useAuth();
    const { canViewHR, canViewPayroll, canManageUsers, canManageStructures, isEmployee } = usePermissions();
    const location = useLocation();

    // Helper to determine if link is active
    const isActive = (path: string) => {
        if (path === '/dashboard') return location.pathname === '/dashboard' || location.pathname.startsWith('/employee');
        return location.pathname.startsWith(path);
    };
    const getLinkClass = (path: string) =>
        `flex items-center gap-1 text-[15px] cursor-pointer ${isActive(path) ? 'text-blue-600 font-medium' : 'text-slate-600 hover:text-slate-900'}`;

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
            {/* Top Navbar */}
            <header className="bg-white border-b border-gray-200 mt-2 mx-4 rounded-xl shadow-sm px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    {/* Brand / Logo */}
                    <div className="w-10 h-10 rounded-xl border border-blue-200 bg-blue-50/50 flex items-center justify-center">
                        <span className="text-blue-600 font-medium tracking-tight">HR</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex items-center gap-8">
                        {/* ── HR-only: Employees dropdown ─────────────── */}
                        {canViewHR && (
                            <DropdownMenu>
                                <DropdownMenuTrigger className={getLinkClass('/dashboard') + ' outline-none'}>
                                    Employees
                                    <span className="text-[10px] ml-0.5">▼</span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-52 p-2 rounded-xl border border-slate-200 shadow-sm mt-1">
                                    <DropdownMenuItem asChild className="text-[15px] py-2 px-3 bg-blue-50/80 text-blue-600 font-medium mb-1 rounded-lg hover:bg-blue-100 cursor-pointer w-full text-center sm:text-left justify-center sm:justify-start">
                                        <Link to="/dashboard">Employees</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="text-[15px] py-2 px-3 text-slate-700 cursor-pointer mb-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors justify-center sm:justify-start">
                                        <Link to="/contracts">Contracts</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-[15px] py-2 px-3 text-slate-700 cursor-pointer mb-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors justify-center sm:justify-start">
                                        Departments
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-[15px] py-2 px-3 text-slate-700 cursor-pointer rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors justify-center sm:justify-start">
                                        Working Schedule
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        {/* ── Employee self-service: My Profile link ── */}
                        {isEmployee && (
                            <Link to={`/employee/${user?.employeeId}`} className={getLinkClass(`/employee/${user?.employeeId}`)}>
                                My Profile
                            </Link>
                        )}

                        {/* ── HR-only: Contracts top-level link ─────── */}
                        {canViewHR && (
                            <Link to="/contracts" className={getLinkClass('/contracts')}>
                                Contracts
                                <span className="text-[10px] ml-1">▼</span>
                            </Link>
                        )}

                        {/* ── Attendance: visible to everyone ──────── */}
                        <Link to="/attendance" className={getLinkClass('/attendance')}>
                            {isEmployee ? 'My Attendance' : 'Attendance'}
                        </Link>

                        {/* ── Time Off: visible to everyone ─────────── */}
                        <div className="flex items-center gap-1 text-[15px] cursor-pointer text-slate-600 hover:text-slate-900">
                            {isEmployee ? 'My Time Off' : 'Time Off'}
                            <span className="text-[10px] ml-0.5">▼</span>
                        </div>

                        {/* ── Payroll: only payroll users ───────────── */}
                        {canViewPayroll && (
                            <Link to="/payroll" className={getLinkClass('/payroll')}>
                                Payroll
                            </Link>
                        )}

                        {/* ── Reports: admin or payroll manager ─────── */}
                        {(canManageUsers || canManageStructures) && (
                            <Link to="/reports" className={getLinkClass('/reports')}>
                                Reports
                            </Link>
                        )}
                    </nav>
                </div>

                {/* User / Profile section */}
                <div className="flex items-center gap-3">
                    {user && (
                        <span className="text-sm text-slate-500">
                            {user.name} · <span className="font-medium text-slate-700">{ROLE_LABELS[user.role]}</span>
                        </span>
                    )}
                    <button
                        onClick={logout}
                        className="w-8 h-8 rounded bg-red-500 hover:bg-red-600 transition-colors shadow-sm"
                        title="Logout"
                    />
                </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 max-w-[1400px] w-full mx-auto p-8">
                <Outlet />
            </main>
        </div>
    );
}
