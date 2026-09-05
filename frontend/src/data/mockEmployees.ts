export type Employee = {
    id: number | string;
    name: string;
    email: string;
    initials: string;
    role: string;
    department: string;
    status: string;
    phone?: string;
    manager?: string;
    schedule?: string;
    location?: string;
    company?: string;
};

export let mockEmployees: Employee[] = [
    {
        id: 1,
        name: 'Aarav Mehta',
        email: 'aarav@oxp.com',
        initials: 'AM',
        role: 'Payroll Specialist',
        department: 'Finance',
        status: 'Active',
        phone: '+91 98765 43210',
        manager: 'Sara Khan',
        schedule: '40 Hours / Week',
        location: 'Mumbai',
        company: 'OXP Pvt Ltd'
    },
    {
        id: 2,
        name: 'Sara Khan',
        email: 'sara@oxp.com',
        initials: 'SK',
        role: 'HR Officer',
        department: 'HR',
        status: 'Active',
        phone: '+91 98765 54321',
        manager: 'Tanya Singh',
        schedule: '40 Hours / Week',
        location: 'Pune',
        company: 'OXP Pvt Ltd'
    },
    {
        id: 3,
        name: 'John Dsouza',
        email: 'john@oxp.com',
        initials: 'JD',
        role: 'Developer',
        department: 'Engineering',
        status: 'Active',
        phone: '+91 98765 67890',
        manager: 'Rahul Bajaj',
        schedule: '40 Hours / Week',
        location: 'Bangalore',
        company: 'OXP Pvt Ltd'
    },
    {
        id: 4,
        name: 'Neha Patel',
        email: 'neha@oxp.com',
        initials: 'NP',
        role: 'Recruiter',
        department: 'HR',
        status: 'Active',
        phone: '+91 98765 09876',
        manager: 'Sara Khan',
        schedule: '40 Hours / Week',
        location: 'Mumbai',
        company: 'OXP Pvt Ltd'
    }
];

export function getEmployeeById(id: string | number | undefined) {
    if (!id) return undefined;
    return mockEmployees.find(emp => String(emp.id) === String(id));
}

export function addEmployee(emp: Omit<Employee, 'id'>) {
    const newId = Date.now();
    const formattedInitials = emp.name ? emp.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2) : 'XX';
    const newEmployee = { ...emp, id: newId, initials: formattedInitials };
    mockEmployees = [...mockEmployees, newEmployee];
}
