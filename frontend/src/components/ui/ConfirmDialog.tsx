import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-lg border-2 border-gray-200 shadow-none w-full max-w-md p-6 overflow-hidden">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-none ${
              variant === 'danger'
                ? 'bg-rose-100 text-[#EF4444]'
                : variant === 'warning'
                ? 'bg-amber-100 text-[#F59E0B]'
                : 'bg-blue-100 text-[#3B82F6]'
            }`}
          >
            {variant === 'danger' ? (
              <AlertCircle className="w-6 h-6 stroke-[2.2]" />
            ) : (
              <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-[#111827] tracking-tight">{title}</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 h-10 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 h-10 text-xs font-semibold text-white rounded-md shadow-none hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 ${
              variant === 'danger'
                ? 'bg-[#EF4444] hover:bg-rose-600'
                : variant === 'warning'
                ? 'bg-[#F59E0B] hover:bg-amber-600'
                : 'bg-[#3B82F6] hover:bg-blue-600'
            }`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
