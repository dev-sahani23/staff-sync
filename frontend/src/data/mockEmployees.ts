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

const mockFirstNames = ['Raj', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Divya', 'Rohan', 'Anjali', 'Karan', 'Pooja', 'Sanjay', 'Kavita', 'Arjun', 'Meera', 'Gaurav', 'Riya', 'Avinash', 'Shruti', 'Nitin', 'Nidhi'];
const mockLastNames = ['Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Joshi', 'Mishra', 'Chauhan', 'Yadav', 'Malhotra'];
const mockDepartments = ['Finance', 'Engineering', 'HR', 'Marketing', 'Sales'];
const mockRoles = ['Specialist', 'Manager', 'Analyst', 'Director', 'Officer'];

for (let i = 5; i <= 30; i++) {
    const fn = mockFirstNames[Math.floor(Math.random() * mockFirstNames.length)];
    const ln = mockLastNames[Math.floor(Math.random() * mockLastNames.length)];
    const dept = mockDepartments[Math.floor(Math.random() * mockDepartments.length)];
    const role = `${dept} ${mockRoles[Math.floor(Math.random() * mockRoles.length)]}`;

    mockEmployees.push({
        id: i,
        name: `${fn} ${ln}`,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@oxp.com`,
        initials: `${fn.charAt(0)}${ln.charAt(0)}`,
        role: role,
        department: dept,
        status: Math.random() > 0.1 ? 'Active' : 'On Leave',
        phone: `+91 98765 ${Math.floor(10000 + Math.random() * 90000)}`,
        manager: 'Sara Khan',
        schedule: '40 Hours / Week',
        location: 'Mumbai',
        company: 'OXP Pvt Ltd'
    });
}

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
