import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, type CreateUserPayload } from '@/services/users';
import { employeesApi } from '@/services/employees';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { useAuth } from '@/lib/auth-store';
import { Plus, Search, Shield, X } from 'lucide-react';
import type { User, Role } from '@/types';

export const UsersList: React.FC = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for New User
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<Role>('EMPLOYEE');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: usersApi.list,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', 'for-user-link'],
    queryFn: () => employeesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setIsModalOpen(false);
      setEmail('');
      setSelectedEmployeeId('');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || 'Failed to create user');
    },
  });

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const columns: Column<User>[] = [
    {
      key: 'email',
      header: 'Work Email / Username',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#EAF1F6] text-[#2F5D82] flex items-center justify-center font-bold text-xs">
            {u.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-[#17233D]">{u.email}</div>
            {u.id === currentUser?.id && (
              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-medium">
                (You)
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Assigned Role',
      sortable: true,
      render: (u) => (
        <span className="inline-flex items-center gap-1 font-bold text-xs text-[#3B82F6] bg-blue-50 px-2.5 py-1 rounded-md shadow-none border-0">
          <Shield className="w-3.5 h-3.5 stroke-[2.5]" />
          {u.role}
        </span>
      ),
    },
    {
      key: 'employee',
      header: 'Linked Employee',
      render: (u) => {
        const emp = employees.find((e) => e.id === u.employeeId);
        return emp ? (
          <span className="text-xs font-bold text-gray-900">
            {emp.firstName} {emp.lastName}
          </span>
        ) : (
          <span className="text-xs text-gray-400 font-medium">Unlinked (System User)</span>
        );
      },
    },
    {
      key: 'status',
      header: 'Account Status',
      render: (u) => (
        <StatusBadge status={u.isActive !== false ? 'ACTIVE' : 'INACTIVE'} />
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Admin' },
          { label: 'User Management' },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">User Management</h1>
          <p className="text-sm font-medium text-gray-500 mt-0.5">
            Manage system login credentials, role assignments, and employee links
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 h-10 bg-[#3B82F6] text-white text-xs font-bold rounded-md hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all duration-200 shadow-none"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          New User
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg p-3 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-none border-0">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400 stroke-[2.2]" />
          <input
            type="text"
            placeholder="Search users by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 h-10 text-xs bg-[#F3F4F6] border-0 rounded-md outline-none text-[#111827] focus:bg-white focus:border-2 focus:border-[#3B82F6] transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs font-semibold border-0 rounded-md px-3 h-10 bg-[#F3F4F6] text-[#111827] outline-none focus:bg-white focus:border-2 focus:border-[#3B82F6]"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="HR_PAYROLL_MANAGER">HR_PAYROLL_MANAGER</option>
            <option value="HR_PAYROLL_USER">HR_PAYROLL_USER</option>
            <option value="HR_MANAGER">HR_MANAGER</option>
            <option value="EMPLOYEE">EMPLOYEE</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredUsers}
        keyExtractor={(u) => u.id}
        isLoading={isLoading}
        emptyTitle="No users found"
        emptyDescription="Create system users to grant staff access to PeoplePay360"
        emptyActionText="Create User"
        onEmptyAction={() => setIsModalOpen(true)}
      />

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-lg border-2 border-gray-200 shadow-none w-full max-w-lg p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#111827] tracking-tight">Create New System User</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-md"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate({
                  email,
                  password,
                  role,
                  employeeId: selectedEmployeeId || undefined,
                });
              }}
              className="space-y-4 mt-4"
            >
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Link Employee Profile (Optional)
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => {
                    setSelectedEmployeeId(e.target.value);
                    const matched = employees.find((emp) => emp.id === e.target.value);
                    if (matched) setEmail(matched.email);
                  }}
                  className="w-full text-xs bg-[#F3F4F6] border-0 rounded-md h-10 px-3 outline-none text-[#111827] focus:bg-white focus:border-2 focus:border-[#3B82F6]"
                >
                  <option value="">-- Standalone Administrator Account --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.email}) - {emp.department || 'General'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Work Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@company.com"
                  className="w-full text-xs bg-[#F3F4F6] border-0 rounded-md h-10 px-3 outline-none text-[#111827] focus:bg-white focus:border-2 focus:border-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Initial Password *
                </label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs bg-[#F3F4F6] border-0 rounded-md h-10 px-3 outline-none text-[#111827] focus:bg-white focus:border-2 focus:border-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  System Role Assignment *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full text-xs bg-[#F3F4F6] border-0 rounded-md h-10 px-3 outline-none text-[#111827] focus:bg-white focus:border-2 focus:border-[#3B82F6]"
                >
                  <option value="EMPLOYEE">EMPLOYEE (Self-service only)</option>
                  <option value="HR_MANAGER">HR_MANAGER (Full HR, Attendance, Contracts, Leaves)</option>
                  <option value="HR_PAYROLL_USER">HR_PAYROLL_USER (HR + Compute Payroll)</option>
                  <option value="HR_PAYROLL_MANAGER">HR_PAYROLL_MANAGER (Full Payroll, Structures, Approval)</option>
                  <option value="ADMIN">ADMIN (Full access + User management)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 h-10 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 h-10 text-xs font-bold text-white bg-[#3B82F6] hover:bg-blue-600 rounded-md shadow-none hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
