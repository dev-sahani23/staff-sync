import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '@/services/employees';
import { schedulesApi } from '@/services/schedules';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { KanbanBoard } from '@/components/ui/KanbanBoard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Can } from '@/lib/permissions';
import { LayoutGrid, List as ListIcon, Plus, Search, X } from 'lucide-react';
import type { Employee } from '@/types';

export const EmployeesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const currentView = searchParams.get('view') || 'kanban';
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New employee form state
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDepartment, setNewDepartment] = useState('Engineering');
  const [newJobPosition, setNewJobPosition] = useState('');
  const [newScheduleId, setNewScheduleId] = useState('');

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesApi.list(),
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ['schedules'],
    queryFn: () => schedulesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: Partial<Employee>) => employeesApi.create(payload),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsNewModalOpen(false);
      navigate(`/employees/${created.id}`);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || 'Failed to create employee');
    },
  });

  const filteredEmployees = employees.filter((emp) => {
    const matchSearch =
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      (emp.jobPosition || '').toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'ALL' || emp.department === deptFilter;
    return matchSearch && matchDept;
  });

  const departments = Array.from(
    new Set(employees.map((e) => e.department).filter(Boolean) as string[])
  );

  const columns: Column<Employee>[] = [
    {
      key: 'name',
      header: 'Employee',
      sortable: true,
      render: (emp) => {
        const initials = `${emp.firstName?.charAt(0) || ''}${emp.lastName?.charAt(0) || ''}`.toUpperCase();
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAF1F6] border border-blue-100 flex items-center justify-center font-bold text-xs text-[#2F5D82]">
              {initials}
            </div>
            <div>
              <div className="font-semibold text-[#17233D]">
                {emp.firstName} {emp.lastName}
              </div>
              <div className="text-xs text-slate-400">{emp.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'jobPosition',
      header: 'Job Title',
      sortable: true,
      render: (emp) => (
        <span className="text-xs text-slate-700 font-medium">
          {emp.jobPosition || '—'}
        </span>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      render: (emp) => (
        <span className="text-xs text-slate-600">
          {emp.department || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (emp) => <StatusBadge status={emp.status} />,
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'HR' },
          { label: 'Employees Directory' },
        ]}
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#17233D]">Employees</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            All active personnel records, work information, and smart sub-resources
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Switcher Toggle */}
          <div className="flex items-center bg-white rounded-md p-1 shadow-none border-0">
            <button
              onClick={() => setSearchParams({ view: 'kanban' })}
              className={`p-2 rounded-md transition-all duration-150 ${
                currentView === 'kanban'
                  ? 'bg-[#3B82F6] text-white shadow-none'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="Kanban View"
            >
              <LayoutGrid className="w-4 h-4 stroke-[2.2]" />
            </button>
            <button
              onClick={() => setSearchParams({ view: 'list' })}
              className={`p-2 rounded-md transition-all duration-150 ${
                currentView === 'list'
                  ? 'bg-[#3B82F6] text-white shadow-none'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="List View"
            >
              <ListIcon className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          <Can permission="employees:write">
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 h-10 bg-[#3B82F6] text-white text-xs font-bold rounded-md hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all duration-200 shadow-none"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              NEW
            </button>
          </Can>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-lg p-3 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-none border-0">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400 stroke-[2.2]" />
          <input
            type="text"
            placeholder="Search by name, role, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 h-10 text-xs bg-[#F3F4F6] border-0 rounded-md outline-none text-[#111827] focus:bg-white focus:border-2 focus:border-[#3B82F6] transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Department:</span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs font-semibold border-0 rounded-md px-3 h-10 bg-[#F3F4F6] text-[#111827] outline-none focus:bg-white focus:border-2 focus:border-[#3B82F6]"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content: Kanban or List */}
      {currentView === 'kanban' ? (
        <KanbanBoard
          employees={filteredEmployees}
          groupBy="department"
          onCardClick={(emp) => navigate(`/employees/${emp.id}`)}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredEmployees}
          keyExtractor={(emp) => emp.id}
          onRowClick={(emp) => navigate(`/employees/${emp.id}`)}
          isLoading={isLoading}
          emptyTitle="No employees found"
          emptyDescription="Add an employee record to start managing contracts and attendance."
        />
      )}

      {/* New Employee Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-lg border-2 border-gray-200 shadow-none w-full max-w-lg p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#111827] tracking-tight">Create New Employee</h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-md"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate({
                  firstName: newFirstName,
                  lastName: newLastName,
                  email: newEmail,
                  phone: newPhone || undefined,
                  department: newDepartment,
                  jobPosition: newJobPosition,
                  scheduleId: newScheduleId || undefined,
                  status: 'ACTIVE',
                });
              }}
              className="space-y-4 mt-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full text-xs bg-[#F3F4F6] border-0 rounded-md h-10 px-3 outline-none text-[#111827] focus:bg-white focus:border-2 focus:border-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="w-full text-xs bg-[#F3F4F6] border-0 rounded-md h-10 px-3 outline-none text-[#111827] focus:bg-white focus:border-2 focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Work Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full text-xs bg-[#F3F4F6] border-0 rounded-md h-10 px-3 outline-none text-[#111827] focus:bg-white focus:border-2 focus:border-[#3B82F6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="e.g. Engineering"
                    className="w-full text-xs bg-[#F3F4F6] border-0 rounded-md h-10 px-3 outline-none text-[#111827] focus:bg-white focus:border-2 focus:border-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={newJobPosition}
                    onChange={(e) => setNewJobPosition(e.target.value)}
                    placeholder="e.g. Software Engineer"
                    className="w-full text-xs bg-[#F3F4F6] border-0 rounded-md h-10 px-3 outline-none text-[#111827] focus:bg-white focus:border-2 focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full text-xs bg-[#F3F4F6] border-0 rounded-md h-10 px-3 outline-none text-[#111827] focus:bg-white focus:border-2 focus:border-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Working Schedule
                  </label>
                  <select
                    value={newScheduleId}
                    onChange={(e) => setNewScheduleId(e.target.value)}
                    className="w-full text-xs bg-[#F3F4F6] border-0 rounded-md h-10 px-3 outline-none text-[#111827] focus:bg-white focus:border-2 focus:border-[#3B82F6]"
                  >
                    <option value="">-- Assign Later --</option>
                    {schedules.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 h-10 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 h-10 text-xs font-bold text-white bg-[#3B82F6] hover:bg-blue-600 rounded-md shadow-none hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saving...' : 'Save & Open Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
