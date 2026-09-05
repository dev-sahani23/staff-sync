import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payrunsApi } from '@/services/payruns';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Can } from '@/lib/permissions';
import {
  Calculator,
  CheckCheck,
  CreditCard,
  Send,
  AlertTriangle,
  Clock,
  Layers,
} from 'lucide-react';
import type { Payslip } from '@/types';

export const PayrunDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [confirmPaidOpen, setConfirmPaidOpen] = useState(false);
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);

  const { data: payrun, isLoading } = useQuery({
    queryKey: ['payrun', id],
    queryFn: () => payrunsApi.get(id!),
    enabled: !!id,
  });

  const computeMutation = useMutation({
    mutationFn: () => payrunsApi.compute(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrun', id] });
      queryClient.invalidateQueries({ queryKey: ['payruns'] });
      alert('Payroll calculations completed successfully.');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || 'Compute failed');
    },
  });

  const validateMutation = useMutation({
    mutationFn: () => payrunsApi.validate(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrun', id] });
      queryClient.invalidateQueries({ queryKey: ['payruns'] });
      alert('Payrun validated. Status is now VALIDATED.');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || 'Validation failed');
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: () => payrunsApi.markPaid(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrun', id] });
      queryClient.invalidateQueries({ queryKey: ['payruns'] });
      setConfirmPaidOpen(false);
      alert('Payrun finalized. Status is now PAID. Historical records locked.');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || 'Payment finalization failed');
    },
  });

  const sendPayslipsMutation = useMutation({
    mutationFn: () => payrunsApi.sendPayslips(id!),
    onSuccess: (data) => {
      setConfirmSendOpen(false);
      alert(`Payslip distribution complete. Sent to ${data.sentCount} employees.`);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || 'Distribution failed');
    },
  });

  if (isLoading || !payrun) {
    return (
      <div className="animate-pulse space-y-4 max-w-5xl mx-auto">
        <div className="h-6 bg-slate-200 rounded w-48" />
        <div className="h-32 bg-white rounded-xl border border-slate-200" />
      </div>
    );
  }

  const isDraft = payrun.status === 'DRAFT';
  const isComputed = payrun.status === 'COMPUTED';
  const isValidated = payrun.status === 'VALIDATED';
  const isPaid = payrun.status === 'PAID';

  const payslips = payrun.payslips || [];

  const columns: Column<Payslip>[] = [
    {
      key: 'employee',
      header: 'Employee Name',
      sortable: true,
      render: (s) => (
        <div className="font-semibold text-[#17233D]">
          {s.employee ? `${s.employee.firstName} ${s.employee.lastName}` : 'Employee'}
          <div className="text-xs text-slate-400 font-normal">
            {s.employee?.department || 'General'}
          </div>
        </div>
      ),
    },
    {
      key: 'workedDays',
      header: 'Attendance Days',
      align: 'right',
      render: (s) => (
        <span className="text-xs font-semibold tabular-nums text-slate-700">
          {s.workedDays} days
        </span>
      ),
    },
    {
      key: 'wage',
      header: 'Contracted Wage',
      align: 'right',
      render: (s) => (
        <span className="text-xs font-medium tabular-nums text-slate-600">
          ₹{s.contract?.wage?.toLocaleString('en-IN') || '—'}
        </span>
      ),
    },
    {
      key: 'net',
      header: 'Calculated Net Pay',
      align: 'right',
      render: (s) => {
        // Find net line or compute
        const netLine = s.lines?.find(
          (l) => l.salaryRule?.category === 'NET' || l.label.toUpperCase().includes('NET')
        );
        if (!netLine) {
          return <span className="text-xs text-slate-400 italic">Pending Compute</span>;
        }
        return (
          <span className="text-xs font-bold text-[#1E7A4C] tabular-nums">
            ₹{netLine.amount.toLocaleString('en-IN')}
          </span>
        );
      },
    },
    {
      key: 'warnings',
      header: 'Issues / Warnings',
      render: (s) => {
        const hasWarning = !s.employee?.bankName || !s.employee?.accountNumber || s.warnings;
        if (!hasWarning) {
          return <span className="text-slate-300 text-xs">—</span>;
        }
        return (
          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B4780A] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            <AlertTriangle className="w-3 h-3" />
            <span>Missing Bank Details</span>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Payruns', href: '/payroll/payruns' },
          { label: payrun.name },
        ]}
      />

      {/* Payrun Header Card */}
      <div className="bg-white rounded-lg p-6 mb-6 shadow-none border-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">{payrun.name}</h1>
              <StatusBadge status={payrun.status} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-medium mt-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400 stroke-[2.2]" />
                <span>
                  Period: {new Date(payrun.periodStart).toLocaleDateString()} – {new Date(payrun.periodEnd).toLocaleDateString()}
                </span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-gray-400 stroke-[2.2]" />
                <span>Structure: {payrun.salaryStructure?.name || 'Standard Structure'}</span>
              </span>
            </div>
          </div>

          {/* Lifecycle Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Step 3: Compute Button */}
            {!isPaid && (
              <Can permission="payroll:write">
                <button
                  type="button"
                  onClick={() => computeMutation.mutate()}
                  disabled={computeMutation.isPending}
                  className="inline-flex items-center gap-2 px-5 h-10 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-md text-xs font-bold shadow-none hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50"
                >
                  <Calculator className="w-4 h-4 stroke-[2.2]" />
                  {computeMutation.isPending ? 'Computing...' : isComputed ? 'Recompute All' : 'Compute Payrun'}
                </button>
              </Can>
            )}

            {/* Step 4a: Validate Button (Gated by COMPUTED status & Payroll Manager) */}
            {!isPaid && (
              <Can permission="payroll:approve">
                <button
                  type="button"
                  onClick={() => validateMutation.mutate()}
                  disabled={!isComputed || validateMutation.isPending}
                  title={!isComputed ? 'Run computation first before validating' : 'Validate Payrun'}
                  className="inline-flex items-center gap-2 px-5 h-10 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-md text-xs font-bold shadow-none hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCheck className="w-4 h-4 stroke-[2.5]" />
                  {validateMutation.isPending ? 'Validating...' : 'Validate Batch'}
                </button>
              </Can>
            )}

            {/* Step 4b: Mark as Paid Button (Gated by VALIDATED status) */}
            {!isPaid && (
              <Can permission="payroll:approve">
                <button
                  type="button"
                  onClick={() => setConfirmPaidOpen(true)}
                  disabled={!isValidated}
                  title={!isValidated ? 'Batch must be validated before marking paid' : 'Mark as Paid'}
                  className="inline-flex items-center gap-2 px-5 h-10 bg-[#10B981] hover:bg-emerald-600 text-white rounded-md text-xs font-bold shadow-none hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CreditCard className="w-4 h-4 stroke-[2.2]" />
                  Mark as Paid
                </button>
              </Can>
            )}

            {/* Step 5: Send Payslips via Email */}
            {(isValidated || isPaid) && (
              <Can permission="payroll:approve">
                <button
                  type="button"
                  onClick={() => setConfirmSendOpen(true)}
                  disabled={sendPayslipsMutation.isPending}
                  className="inline-flex items-center gap-2 px-5 h-10 bg-[#F3F4F6] text-gray-800 hover:bg-gray-200 rounded-md text-xs font-bold shadow-none hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <Send className="w-4 h-4 stroke-[2.2] text-[#3B82F6]" />
                  Send Payslips via Email
                </button>
              </Can>
            )}
          </div>
        </div>

        {/* Status Lifecycle Stepper Guidance */}
        <div className="pt-4 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Lifecycle Progress:{' '}
            <span className="font-semibold text-[#17233D]">
              {isDraft && 'Draft (Scope Defined) → Run Compute to generate rule lines'}
              {isComputed && 'Computed → Review payslips, then Validate'}
              {isValidated && 'Validated → Ready to Mark as Paid and disburse'}
              {isPaid && 'Paid → Historical payroll record locked'}
            </span>
          </span>
          <span className="font-semibold tabular-nums text-slate-700">
            {payslips.length} Payslips in Batch
          </span>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-[#17233D]">Payslips in this Payrun</h3>
        <span className="text-xs text-slate-400">Click any row to view calculation breakdown</span>
      </div>

      <DataTable
        columns={columns}
        data={payslips}
        keyExtractor={(s) => s.id}
        onRowClick={(s) => navigate(`/payroll/payslips/${s.id}`)}
        emptyTitle="No payslips generated in this batch"
        emptyDescription="Ensure contracts exist for the assigned structure and period."
      />

      {/* Confirm Paid Modal */}
      <ConfirmDialog
        isOpen={confirmPaidOpen}
        onClose={() => setConfirmPaidOpen(false)}
        onConfirm={() => markPaidMutation.mutate()}
        title="Finalize Payrun as PAID?"
        description="Marking this payrun as Paid will lock all payslip calculation lines into permanent financial history. This operation is non-reversible."
        confirmLabel="Confirm & Mark Paid"
        variant="warning"
        isLoading={markPaidMutation.isPending}
      />

      {/* Confirm Send Email Modal */}
      <ConfirmDialog
        isOpen={confirmSendOpen}
        onClose={() => setConfirmSendOpen(false)}
        onConfirm={() => sendPayslipsMutation.mutate()}
        title="Email Payslips to Employees?"
        description={`Send digital payslips and salary breakdown notifications to all ${payslips.length} employees included in this payrun.`}
        confirmLabel="Send Payslips"
        variant="primary"
        isLoading={sendPayslipsMutation.isPending}
      />
    </div>
  );
};
