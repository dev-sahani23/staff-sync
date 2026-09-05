import { Button } from '@/components/ui/button';

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 pb-12 pt-4">
            <Button
                variant="outline"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="rounded-lg h-9 px-3 text-sm text-slate-600 shadow-sm"
            >
                Previous
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    {pageNum}
                </button>
            ))}

            <Button
                variant="outline"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg h-9 px-3 text-sm text-slate-600 shadow-sm"
            >
                Next
            </Button>
        </div>
    );
}
