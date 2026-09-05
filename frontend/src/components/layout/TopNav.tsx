import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, ROLE_LABELS } from '@/lib/auth-store';
import { usePermissions } from '@/lib/permissions';
import { AttendanceWidget } from './AttendanceWidget';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, LogOut, Shield } from 'lucide-react';

export const TopNav: React.FC = () => {
  const { user, logout } = useAuth();
  const { isEmployee, isHR, isPayrollUser, isAdmin } = usePermissions();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/employees') return location.pathname.startsWith('/employees') || location.pathname.startsWith('/employee/');
    if (path === '/payroll') return location.pathname.startsWith('/payroll');
    if (path === '/timeoff') return location.pathname.startsWith('/timeoff');
    return location.pathname.startsWith(path);
  };

  const navLinkClass = (active: boolean) =>
    `inline-flex items-center gap-1 text-sm font-semibold transition-all duration-200 cursor-pointer py-1.5 px-3 rounded-md shadow-none hover:scale-105 ${
      active
        ? 'bg-[#3B82F6] text-white'
        : 'text-gray-700 hover:text-[#111827] hover:bg-gray-100'
    }`;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-3 flex items-center justify-between shadow-none">
      <div className="flex items-center gap-6">
        {/* Brand / Logo */}
        <Link
          to={isEmployee ? `/employees/${user?.employeeId}` : '/payroll'}
          className="flex items-center gap-2.5 font-bold text-base text-[#111827] group"
        >
          <div className="w-8 h-8 rounded-md bg-[#3B82F6] text-white flex items-center justify-center font-extrabold text-sm tracking-tight group-hover:bg-blue-600 transition-all duration-200 shadow-none">
            HR
          </div>
          <span className="tracking-tight text-gray-900 font-extrabold text-lg">PeoplePay360</span>
        </Link>

        {/* Global Navigation Menu */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* HR-Level Navigation */}
          {isHR && (
            <DropdownMenu>
              <DropdownMenuTrigger className={navLinkClass(isActive('/employees')) + ' outline-none border-0'}>
                <span>Employees</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70 ml-0.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52 p-1.5 rounded-lg border-2 border-gray-200 bg-white shadow-none">
                <DropdownMenuItem asChild>
                  <Link to="/employees" className="cursor-pointer font-semibold py-2 rounded-md hover:bg-gray-100">
                    Employees Directory
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/schedules" className="cursor-pointer py-2 rounded-md hover:bg-gray-100 font-medium">
                    Working Schedules
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/departments" className="cursor-pointer py-2 rounded-md hover:bg-gray-100 font-medium">
                    Departments
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator className="my-1 bg-gray-200" />
                    <DropdownMenuItem asChild>
                      <Link to="/admin/users" className="cursor-pointer py-2 text-[#3B82F6] font-bold flex items-center gap-2 rounded-md hover:bg-blue-50">
                        <Shield className="w-4 h-4 stroke-[2.2]" />
                        User Management
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Employee Self-Service: My Profile */}
          {isEmployee && user?.employeeId && (
            <Link
              to={`/employees/${user.employeeId}`}
              className={navLinkClass(location.pathname === `/employees/${user.employeeId}`)}
            >
              My Profile
            </Link>
          )}

          {/* Contracts Dropdown / Link (HR+) */}
          {isHR && (
            <DropdownMenu>
              <DropdownMenuTrigger className={navLinkClass(isActive('/contracts')) + ' outline-none border-0'}>
                <span>Contracts</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70 ml-0.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 p-1.5 rounded-lg border-2 border-gray-200 bg-white shadow-none">
                <DropdownMenuItem asChild>
                  <Link to="/contracts" className="cursor-pointer font-semibold py-2 rounded-md hover:bg-gray-100">
                    All Contracts
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Attendance (Everyone) */}
          <Link to="/attendance" className={navLinkClass(isActive('/attendance'))}>
            Attendance
          </Link>

          {/* Time Off */}
          <DropdownMenu>
            <DropdownMenuTrigger className={navLinkClass(isActive('/timeoff')) + ' outline-none border-0'}>
              <span>Time Off</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70 ml-0.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 p-1.5 rounded-lg border-2 border-gray-200 bg-white shadow-none">
              <DropdownMenuItem asChild>
                <Link to="/timeoff" className="cursor-pointer font-semibold py-2 rounded-md hover:bg-gray-100">
                  Time Off Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/timeoff/requests" className="cursor-pointer py-2 rounded-md hover:bg-gray-100 font-medium">
                  Requests
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/timeoff/allocations" className="cursor-pointer py-2 rounded-md hover:bg-gray-100 font-medium">
                  Allocations
                </Link>
              </DropdownMenuItem>
              {isHR && (
                <>
                  <DropdownMenuSeparator className="my-1 bg-gray-200" />
                  <DropdownMenuItem asChild>
                    <Link to="/timeoff/types" className="cursor-pointer py-2 rounded-md hover:bg-gray-100 font-medium">
                      Time Off Types
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Payroll (HR Payroll User+) */}
          {isPayrollUser && (
            <DropdownMenu>
              <DropdownMenuTrigger className={navLinkClass(isActive('/payroll')) + ' outline-none border-0'}>
                <span>Payroll</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70 ml-0.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 p-1.5 rounded-lg border-2 border-gray-200 bg-white shadow-none">
                <DropdownMenuItem asChild>
                  <Link to="/payroll" className="cursor-pointer font-bold py-2 rounded-md hover:bg-gray-100">
                    Payroll Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-gray-200" />
                <DropdownMenuItem asChild>
                  <Link to="/payroll/payruns" className="cursor-pointer py-2 font-semibold rounded-md hover:bg-gray-100">
                    Payruns
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/payroll/payslips" className="cursor-pointer py-2 font-semibold rounded-md hover:bg-gray-100">
                    Payslips
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-gray-200" />
                <DropdownMenuItem asChild>
                  <Link to="/payroll/structures" className="cursor-pointer py-2 text-gray-700 rounded-md hover:bg-gray-100 font-medium">
                    Salary Structures
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/payroll/rules" className="cursor-pointer py-2 text-gray-700 rounded-md hover:bg-gray-100 font-medium">
                    Salary Rules
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Employee self-service: My Payslips */}
          {isEmployee && (
            <Link to="/payroll/payslips" className={navLinkClass(isActive('/payroll/payslips'))}>
              My Payslips
            </Link>
          )}
        </nav>
      </div>

      {/* Right User & Actions Bar */}
      <div className="flex items-center gap-3">
        {/* Floating Attendance Widget */}
        <AttendanceWidget />

        {/* User Badge */}
        {user && (
          <div className="hidden sm:flex flex-col text-right pr-1">
            <span className="text-xs font-bold text-[#111827] truncate max-w-[150px]">
              {user.email}
            </span>
            <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider">
              {ROLE_LABELS[user.role] || user.role}
            </span>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          className="p-2 rounded-md text-gray-500 hover:text-[#EF4444] hover:bg-rose-50 hover:scale-105 transition-all duration-200 shadow-none border-0"
          title="Sign out"
        >
          <LogOut className="w-4 h-4 stroke-[2.2]" />
        </button>
      </div>
    </header>
  );
};
