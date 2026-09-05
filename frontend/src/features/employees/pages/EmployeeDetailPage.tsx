import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '@/services/employees';
import { schedulesApi } from '@/services/schedules';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { SmartButtonBar, type SmartButton } from '@/components/ui/SmartButtonBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/lib/auth-store';
import { usePermissions } from '@/lib/permissions';
import {
  FileText,
  Clock,
  Calendar,
  Layers,
  Save,
  Mail,
  Phone,
  Building,
  Briefcase,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import type { Employee } from '@/types';

export const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { canManageEmployees } = usePermissions();

  const [activeTab, setActiveTab] = useState<'work' | 'private'>('work');

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeesApi.get(id!),
    enabled: !!id,
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ['employee', id, 'contracts'],
    queryFn: () => employeesApi.getContracts(id!),
    enabled: !!id,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['employee', id, 'attendance'],
    queryFn: () => employeesApi.getAttendance(id!),
    enabled: !!id,
  });

  const { data: timeoff = [] } = useQuery({
    queryKey: ['employee', id, 'timeoff'],
    queryFn: () => employeesApi.getTimeOff(id!),
    enabled: !!id,
  });

  const { data: allocations = [] } = useQuery({
    queryKey: ['employee', id, 'allocations'],
    queryFn: () => employeesApi.getAllocations(id!),
    enabled: !!id,
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ['schedules'],
    queryFn: () => schedulesApi.list(),
  });

  // Form state
  const [formData, setFormData] = useState<Partial<Employee>>({});

  React.useEffect(() => {
    if (employee) {
      setFormData(employee);
    }
  }, [employee]);

  // Self-protection & permissions check:
  // User cannot edit their own credentials/profile, even if they have HR role.
  // Regular employees cannot edit any profile.
  const isViewingSelf = Boolean(
    (user?.employeeId && employee?.id === user.employeeId) ||
    (user?.email && employee?.email && user.email.toLowerCase() === employee.email.toLowerCase())
  );

  const canEdit = Boolean(canManageEmployees && !isViewingSelf);

  const handleSave = () => {
    const payload = {
      department: formData.department,
      jobPosition: formData.jobPosition,
      scheduleId: formData.scheduleId || null,
      status: formData.status,
      phone: formData.phone,
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
    };
    updateMutation.mutate(payload);
  };

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<Employee>) => employeesApi.update(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      alert('Employee profile updated successfully.');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || 'Failed to update employee');
    },
  });

  if (isLoading || !employee) {
    return (
      <div className="animate-pulse space-y-4 max-w-4xl mx-auto">
        <div className="h-6 bg-slate-200 rounded w-48" />
        <div className="h-32 bg-white rounded-lg border-0" />
      </div>
    );
  }

  const smartButtons: SmartButton[] = [
    {
      label: 'Contracts',
      count: contracts.length,
      icon: FileText,
      onClick: () => navigate(`/contracts?employeeId=${id}`),
    },
    {
      label: 'Attendance',
      count: attendance.length,
      icon: Clock,
      onClick: () => navigate(`/attendance?employeeId=${id}`),
    },
    {
      label: 'Time Off Requests',
      count: timeoff.length,
      icon: Calendar,
      onClick: () => navigate(`/timeoff/requests?employeeId=${id}`),
    },
    {
      label: 'Allocations',
      count: allocations.length,
      icon: Layers,
      onClick: () => navigate(`/timeoff/allocations?employeeId=${id}`),
    },
  ];

  const initials = `${employee.firstName?.charAt(0) || ''}${employee.lastName?.charAt(0) || ''}`.toUpperCase();

  const getInputClass = () =>
    canEdit
      ? 'w-full text-xs font-medium bg-[#F3F4F6] border-0 rounded-md h-10 px-3 outline-none text-[#111827] focus:bg-white focus:border-2 focus:border-[#3B82F6]'
      : 'w-full text-xs font-medium bg-[#F3F4F6] border-0 rounded-md h-10 px-3 outline-none text-gray-600 cursor-not-allowed select-all';

  return (
    <div className="max-w-[960px] mx-auto">
      <Breadcrumb
        items={[
          { label: 'Employees', href: '/employees' },
          { label: `${employee.firstName} ${employee.lastName}` },
        ]}
      />

      {/* Profile Header Box */}
      <div className="bg-white rounded-lg p-6 mb-6 shadow-none border-0">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-md bg-blue-50 text-[#3B82F6] flex items-center justify-center font-extrabold text-xl shrink-0 shadow-none">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">
                  {employee.firstName} {employee.lastName}
                </h1>
                <StatusBadge status={employee.status} />
              </div>
              <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5 mt-1">
                <Briefcase className="w-3.5 h-3.5 text-gray-400 stroke-[2.2]" />
                <span>{employee.jobPosition || 'Employee'}</span>
                <span>•</span>
                <Building className="w-3.5 h-3.5 text-gray-400 stroke-[2.2]" />
                <span>{employee.department || 'General'}</span>
              </p>
              <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mt-2">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400 stroke-[2.2]" />
                  {employee.email}
                </span>
                {employee.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400 stroke-[2.2]" />
                    {employee.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 h-10 px-5 bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-bold rounded-md shadow-none hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50"
            >
              <Save className="w-4 h-4 stroke-[2.2]" />
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>

        {/* Smart Button Bar */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <SmartButtonBar buttons={smartButtons} />
        </div>
      </div>

      {/* Security & Access Banner */}
      {isViewingSelf ? (
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg mb-6 border-0 text-xs shadow-none">
          <Lock className="w-4 h-4 text-[#3B82F6] stroke-[2.5] shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-[#111827]">Personal Profile (Self-Service View)</div>
            <div className="text-gray-600 mt-0.5 font-medium">
              You are viewing your own profile records. To prevent identity and payroll discrepancies, personal information, employment terms, and banking credentials cannot be self-edited and must be updated through HR / Payroll Administration.
            </div>
          </div>
        </div>
      ) : !canManageEmployees ? (
        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg mb-6 border-0 text-xs shadow-none">
          <ShieldAlert className="w-4 h-4 text-amber-600 stroke-[2.5] shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-950">Read-Only View</div>
            <div className="text-amber-800 mt-0.5 font-medium">
              You do not have administrative permissions to modify employee profiles.
            </div>
          </div>
        </div>
      ) : null}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('work')}
          className={`px-4 py-2 text-xs font-bold rounded-md transition-all duration-150 ${
            activeTab === 'work'
              ? 'bg-[#3B82F6] text-white shadow-none'
              : 'bg-[#F3F4F6] text-gray-700 hover:bg-gray-200'
          }`}
        >
          Work Information
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('private')}
          className={`px-4 py-2 text-xs font-bold rounded-md transition-all duration-150 ${
            activeTab === 'private'
              ? 'bg-[#3B82F6] text-white shadow-none'
              : 'bg-[#F3F4F6] text-gray-700 hover:bg-gray-200'
          }`}
        >
          Private & Financial Information
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-lg p-6 shadow-none border-0">
        {activeTab === 'work' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Department</span>
                  {!canEdit && <Lock className="w-3 h-3 text-gray-400 stroke-[2.2]" />}
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  readOnly={!canEdit}
                  value={formData.department || ''}
                  onChange={(e) => canEdit && setFormData({ ...formData, department: e.target.value })}
                  className={getInputClass()}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Job Position / Title</span>
                  {!canEdit && <Lock className="w-3 h-3 text-gray-400 stroke-[2.2]" />}
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  readOnly={!canEdit}
                  value={formData.jobPosition || ''}
                  onChange={(e) => canEdit && setFormData({ ...formData, jobPosition: e.target.value })}
                  className={getInputClass()}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Working Schedule</span>
                  {!canEdit && <Lock className="w-3 h-3 text-gray-400 stroke-[2.2]" />}
                </label>
                <select
                  disabled={!canEdit}
                  value={formData.scheduleId || ''}
                  onChange={(e) => canEdit && setFormData({ ...formData, scheduleId: e.target.value })}
                  className={getInputClass()}
                >
                  <option value="">-- No Schedule Assigned --</option>
                  {schedules.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Employment Status</span>
                  {!canEdit && <Lock className="w-3 h-3 text-gray-400 stroke-[2.2]" />}
                </label>
                <select
                  disabled={!canEdit}
                  value={formData.status || 'ACTIVE'}
                  onChange={(e) => canEdit && setFormData({ ...formData, status: e.target.value as any })}
                  className={getInputClass()}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Phone Number</span>
                  {!canEdit && <Lock className="w-3 h-3 text-gray-400 stroke-[2.2]" />}
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  readOnly={!canEdit}
                  value={formData.phone || ''}
                  onChange={(e) => canEdit && setFormData({ ...formData, phone: e.target.value })}
                  className={getInputClass()}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Bank Name</span>
                  {!canEdit && <Lock className="w-3 h-3 text-gray-400 stroke-[2.2]" />}
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  readOnly={!canEdit}
                  value={formData.bankName || ''}
                  placeholder="e.g. HDFC Bank, ICICI Bank"
                  onChange={(e) => canEdit && setFormData({ ...formData, bankName: e.target.value })}
                  className={getInputClass()}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Account Number</span>
                {!canEdit && <Lock className="w-3 h-3 text-gray-400 stroke-[2.2]" />}
              </label>
              <input
                type="text"
                disabled={!canEdit}
                readOnly={!canEdit}
                value={formData.accountNumber || ''}
                placeholder="e.g. 50100456789123"
                onChange={(e) => canEdit && setFormData({ ...formData, accountNumber: e.target.value })}
                className={getInputClass()}
              />
              {!formData.bankName && !formData.accountNumber && (
                <p className="text-[11px] text-amber-700 font-semibold mt-1.5">
                  ⚠️ Missing banking details will trigger warnings during payroll processing.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
