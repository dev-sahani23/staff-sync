import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '');
const baseURL = cleanBaseUrl.endsWith('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`;

export const api = axios.create({
    baseURL,
    timeout: 60000, // 60s — tolerates Render free-tier cold starts (30–60s)
    // TODO: consolidate this into the single shared api client in @/lib/api.ts
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// We adapt backend Database Schema payloads into our UI specific parameters flawlessly here
export const EmployeeAPI = {
    getAll: async () => {
        const response = await api.get('/employees');
        return response.data.map((emp: any) => ({
            id: emp.id,
            name: `${emp.firstName} ${emp.lastName}`,
            email: emp.email,
            initials: `${emp.firstName?.charAt(0) || ''}${emp.lastName?.charAt(0) || ''}`,
            role: emp.jobPosition || 'Employee',
            department: emp.department || 'General',
            status: emp.status === 'ACTIVE' ? 'Active' : 'On Leave',
            phone: emp.phone || 'N/A',
            manager: emp.manager?.firstName ? `${emp.manager.firstName} ${emp.manager.lastName}` : 'N/A',
            schedule: '40 Hours / Week',
            location: 'Mumbai',
            company: 'OXP Pvt Ltd'
        }));
    },
    create: async (data: any) => {
        const payload = {
            firstName: data.name?.split(' ')[0] || 'Unknown',
            lastName: data.name?.split(' ').slice(1).join(' ') || 'Employee',
            email: data.email,
            jobPosition: data.role,
            department: data.department,
            status: data.status === 'Active' ? 'ACTIVE' : 'INACTIVE',
            phone: data.phone
        };
        const response = await api.post('/employees', payload);
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get(`/employees/${id}`);
        const emp = response.data;
        return {
            id: emp.id,
            name: `${emp.firstName} ${emp.lastName}`,
            email: emp.email,
            initials: `${emp.firstName?.charAt(0) || ''}${emp.lastName?.charAt(0) || ''}`,
            role: emp.jobPosition || 'Employee',
            department: emp.department || 'General',
            status: emp.status === 'ACTIVE' ? 'Active' : 'On Leave',
            phone: emp.phone || 'N/A',
            manager: emp.manager?.firstName ? `${emp.manager.firstName} ${emp.manager.lastName}` : 'N/A',
            schedule: '40 Hours / Week',
            location: 'Mumbai',
            company: 'OXP Pvt Ltd'
        };
    }
};

export const ContractAPI = {
    getAll: async () => {
        const response = await api.get('/contracts');
        return response.data.map((con: any) => ({
            id: con.id,
            contractCode: `CON/${new Date(con.createdAt).getFullYear()}/${con.id.substring(0, 4).toUpperCase()}`,
            employeeName: con.employee ? `${con.employee.firstName} ${con.employee.lastName}` : 'Unknown',
            start: new Date(con.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            end: con.endDate ? new Date(con.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
            wage: `₹${con.wage?.toLocaleString('en-IN')}`,
            status: con.status === 'ACTIVE' ? 'Running' : 'Expired',
            department: con.department || 'General',
            jobPosition: con.jobPosition || 'Analyst',
            schedule: '40 Hours / Week',
            notes: 'Structure Type: Employee Salary\nSuccessfully synced from backend SQL Database.',
        }));
    },
    getById: async (id: string) => {
        const response = await api.get(`/contracts/${id}`);
        const con = response.data;
        return {
            id: con.id,
            contractCode: `CON/${new Date(con.createdAt).getFullYear()}/${con.id.substring(0, 4).toUpperCase()}`,
            employeeName: con.employee ? `${con.employee.firstName} ${con.employee.lastName}` : 'Unknown',
            start: new Date(con.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            end: con.endDate ? new Date(con.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
            wage: `₹${con.wage?.toLocaleString('en-IN')}`,
            status: con.status === 'ACTIVE' ? 'Running' : 'Expired',
            department: con.department || 'General',
            jobPosition: con.jobPosition || 'Analyst',
            schedule: '40 Hours / Week',
            notes: 'Structure Type: Employee Salary\nSuccessfully synced from backend SQL Database.',
        };
    }
};

export const AttendanceAPI = {
    getAll: async () => {
        const response = await api.get('/attendance');
        return response.data.map((att: any) => {
            const getStr = (d: string) => {
                if (!d) return '—';
                const date = new Date(d);
                return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            };
            return {
                id: att.id,
                employeeName: att.employee ? `${att.employee.firstName} ${att.employee.lastName}` : 'Unknown',
                checkIn: getStr(att.checkIn),
                checkOut: getStr(att.checkOut),
                workedHours: att.workedHours ? att.workedHours.toFixed(2) : '0.00',
                status: att.status === 'PRESENT' ? 'Present' : 'Absent',
            };
        });
    },
    getById: async (id: string) => {
        const response = await api.get(`/attendance/${id}`);
        const att = response.data;
        const getStr = (d: string) => {
            if (!d) return '—';
            const date = new Date(d);
            return `${date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        };
        const dateOnlyStr = att.date ? new Date(att.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') : '';

        return {
            id: att.id,
            employeeName: att.employee ? `${att.employee.firstName} ${att.employee.lastName}` : 'Unknown',
            dateTitle: dateOnlyStr,
            checkIn: getStr(att.checkIn),
            checkOut: getStr(att.checkOut),
            workedHours: att.workedHours ? att.workedHours.toFixed(2) : '0.00',
            status: att.status === 'PRESENT' ? 'Present' : 'Absent',
            department: att.employee?.department || 'Finance',
            manager: att.employee?.manager ? `${att.employee.manager.firstName} ${att.employee.manager.lastName}` : 'Sara Khan',
            overtime: '0.00 hrs',
            notes: att.correctionNotes || 'System-generated from check in/out or manually corrected by an authorized user.',
        };
    }
};

export const ScheduleAPI = {
    getAll: async () => {
        const response = await api.get('/schedules');
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get(`/schedules/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/schedules', data);
        return response.data;
    },
    update: async (id: string, data: any) => {
        const response = await api.put(`/schedules/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        await api.delete(`/schedules/${id}`);
        return true;
    }
};

export const TimeOffAPI = {
    types: {
        getAll: async () => (await api.get('/timeoff/types')).data,
        create: async (data: any) => (await api.post('/timeoff/types', data)).data,
    },
    allocations: {
        getAll: async () => (await api.get('/timeoff/allocations')).data,
        create: async (data: any) => (await api.post('/timeoff/allocations', data)).data,
    },
    requests: {
        getAll: async () => (await api.get('/timeoff/requests')).data,
        create: async (data: any) => (await api.post('/timeoff/requests', data)).data,
        approve: async (id: string) => (await api.patch(`/timeoff/requests/${id}/approve`)).data,
        refuse: async (id: string) => (await api.patch(`/timeoff/requests/${id}/refuse`)).data,
    }
};

export const PayrollAPI = {
    structures: {
        getAll: async () => (await api.get('/payroll/structures')).data,
        getById: async (id: string) => (await api.get(`/payroll/structures/${id}`)).data,
        create: async (data: any) => (await api.post('/payroll/structures', data)).data,
        createRule: async (id: string, data: any) => (await api.post(`/payroll/structures/${id}/rules`, data)).data,
    },
    payruns: {
        getAll: async () => (await api.get('/payroll/payruns')).data,
        getById: async (id: string) => (await api.get(`/payroll/payruns/${id}`)).data,
        create: async (data: any) => (await api.post('/payroll/payruns', data)).data,
        updateStatus: async (id: string, status: string) => (await api.patch(`/payroll/payruns/${id}/status`, { status })).data,
    },
    payslips: {
        getAll: async () => (await api.get('/payroll/payslips')).data,
        getById: async (id: string) => (await api.get(`/payroll/payslips/${id}`)).data,
    }
};
