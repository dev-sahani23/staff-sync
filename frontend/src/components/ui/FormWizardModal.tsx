import React from 'react';
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface FormWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  currentStep: number;
  totalSteps?: number;
  stepTitles: string[];
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  onSubmit?: () => void;
  nextDisabled?: boolean;
  submitDisabled?: boolean;
  isSubmitting?: boolean;
  submitLabel?: string;
  className?: string;
}

export const FormWizardModal: React.FC<FormWizardModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  currentStep,
  totalSteps = 2,
  stepTitles,
  children,
  onNext,
  onBack,
  onSubmit,
  nextDisabled = false,
  submitDisabled = false,
  isSubmitting = false,
  submitLabel = 'Submit',
  className = '',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div
        className={`bg-white rounded-lg border-2 border-gray-200 shadow-none w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] ${className}`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-[#F3F4F6]">
          <div>
            <h2 className="text-base font-bold text-[#111827] tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-all duration-150"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3.5 bg-white border-b border-gray-200 flex items-center gap-3">
          {stepTitles.map((st, idx) => {
            const stepNum = idx + 1;
            const isDone = currentStep > stepNum;
            const isCurrent = currentStep === stepNum;

            return (
              <React.Fragment key={st}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-none ${
                      isDone
                        ? 'bg-[#10B981] text-white'
                        : isCurrent
                        ? 'bg-[#3B82F6] text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : stepNum}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent ? 'text-[#111827]' : 'text-gray-500'
                    }`}
                  >
                    {st}
                  </span>
                </div>
                {idx < stepTitles.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-200" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-[#F3F4F6] flex items-center justify-between">
          <div>
            {currentStep > 1 && onBack && (
              <button
                type="button"
                onClick={onBack}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 h-10 text-xs font-semibold text-gray-700 bg-white rounded-md hover:bg-gray-50 hover:scale-105 transition-all duration-200 shadow-none border-0"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 h-10 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={onNext}
                disabled={nextDisabled}
                className="inline-flex items-center gap-1.5 px-5 h-10 text-xs font-semibold text-white bg-[#3B82F6] hover:bg-blue-600 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-none transition-all duration-200"
              >
                Continue
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onSubmit}
                disabled={submitDisabled || isSubmitting}
                className="inline-flex items-center gap-1.5 px-5 h-10 text-xs font-semibold text-white bg-[#10B981] hover:bg-emerald-600 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-none transition-all duration-200"
              >
                {isSubmitting ? 'Processing...' : submitLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
