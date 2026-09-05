import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { timeoffApi } from '@/services/timeoff';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { KpiCard } from '@/components/ui/KpiCard';
import { Calendar, Layers, Plus, Clock, CheckCircle } from 'lucide-react';
import { usePermissions } from '@/lib/permissions';

export const TimeOffDashboard: React.FC = () => {
  const { isHR } = usePermissions();

  const { data: requests = [] } = useQuery({
    queryKey: ['timeoff', 'requests'],
    queryFn: timeoffApi.getRequests,
  });

  const { data: allocations = [] } = useQuery({
    queryKey: ['timeoff', 'allocations'],
    queryFn: timeoffApi.getAllocations,
  });

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const approvedRequests = requests.filter((r) => r.status === 'APPROVED');
  const totalDaysTaken = approvedRequests.reduce((sum, r) => sum + (r.duration || 0), 0);

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Time Off' },
          { label: 'Dashboard' },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#17233D]">Time Off Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Leave allocations, pending approvals, and absence scheduling
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/timeoff/requests"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2F5D82] text-white text-xs font-semibold rounded-lg hover:bg-[#254B68] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Request Time Off
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard
          label="Pending Approvals"
          value={pendingRequests.length}
          caption="Awaiting HR / Manager review"
          icon={Clock}
        />
        <KpiCard
          label="Approved Days Taken"
          value={totalDaysTaken}
          caption="Total days consumed across team"
          icon={CheckCircle}
        />
        <KpiCard
          label="Active Allocations"
          value={allocations.length}
          caption="Total employee balance grants"
          icon={Layers}
        />
      </div>

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-[#DDE3EC] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#EAF1F6] text-[#2F5D82] flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#17233D]">Leave Requests</h3>
            <p className="text-xs text-slate-500 mt-1">
              Submit and track time off requests. Managers can review, approve, or refuse submissions.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              {pendingRequests.length} pending
            </span>
            <Link
              to="/timeoff/requests"
              className="text-xs font-semibold text-[#2F5D82] hover:underline"
            >
              View Requests →
            </Link>
          </div>
        </div>

        <div className="bg-white border border-[#DDE3EC] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#EAF1F6] text-[#2F5D82] flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#17233D]">Allocations</h3>
            <p className="text-xs text-slate-500 mt-1">
              View employee leave credit balances, remaining days, and annual entitlement quotas.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              {allocations.length} grants
            </span>
            <Link
              to="/timeoff/allocations"
              className="text-xs font-semibold text-[#2F5D82] hover:underline"
            >
              View Allocations →
            </Link>
          </div>
        </div>

        {isHR && (
          <div className="bg-white border border-[#DDE3EC] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#EAF1F6] text-[#2F5D82] flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#17233D]">Time Off Types</h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure corporate leave policies (Paid Time Off, Sick Leave, Casual Leave) and payroll work entry rules.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end">
              <Link
                to="/timeoff/types"
                className="text-xs font-semibold text-[#2F5D82] hover:underline"
              >
                Configure Policies →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
