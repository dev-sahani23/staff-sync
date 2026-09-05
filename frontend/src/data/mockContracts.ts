export type Contract = {
    id: string;
    contractCode: string;
    employeeName: string;
    start: string;
    end: string;
    wage: string;
    status: 'Running' | 'Expired';
    department: string;
    jobPosition: string;
    schedule: string;
    notes: string;
};

export let mockContracts: Contract[] = [
    {
        id: '1',
        contractCode: 'CON/2026/0042',
        employeeName: 'Aarav Mehta',
        start: '01-Jan-2026',
        end: '—',
        wage: '₹85,000',
        status: 'Running',
        department: 'Finance',
        jobPosition: 'Payroll Specialist',
        schedule: '40 Hours / Week',
        notes: 'Structure Type: Employee Salary\nThis running contract is the source for payroll calculation in the active period.',
    },
    {
        id: '2',
        contractCode: 'CON/2025/001',
        employeeName: 'Aarav Mehta',
        start: '01-Jul-2025',
        end: '31-Dec-2025',
        wage: '₹78,000',
        status: 'Expired',
        department: 'Finance',
        jobPosition: 'Payroll Data Entry',
        schedule: '40 Hours / Week',
        notes: 'Structure Type: Employee Salary\nThis contract expired at the end of last year.',
    },
    {
        id: '3',
        contractCode: 'CON/2026/003',
        employeeName: 'Sara Khan',
        start: '01-Jan-2026',
        end: '—',
        wage: '₹95,000',
        status: 'Running',
        department: 'HR',
        jobPosition: 'HR Manager',
        schedule: '40 Hours / Week',
        notes: 'Structure Type: Employee Salary\nThis running contract is the source for payroll calculation in the active period.',
    },
];

export function getContractById(id: string | undefined): Contract | undefined {
    if (!id) return undefined;
    return mockContracts.find(c => c.id === id);
}
