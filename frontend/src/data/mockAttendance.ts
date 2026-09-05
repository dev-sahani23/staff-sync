export type AttendanceRecord = {
    id: string;
    employeeName: string;
    checkIn: string;
    checkOut: string;
    workedHours: string;
    status: 'Present' | 'Absent';
};

export const mockAttendance: AttendanceRecord[] = [
    {
        id: '1',
        employeeName: 'Aarav Mehta',
        checkIn: '09:05',
        checkOut: '18:10',
        workedHours: '9.08',
        status: 'Present',
    },
    {
        id: '2',
        employeeName: 'Sara Khan',
        checkIn: '09:15',
        checkOut: '18:02',
        workedHours: '8.78',
        status: 'Present',
    },
    {
        id: '3',
        employeeName: 'John Dsouza',
        checkIn: '09:32',
        checkOut: '17:58',
        workedHours: '8.43',
        status: 'Present',
    },
    {
        id: '4',
        employeeName: 'Neha Patel',
        checkIn: '—',
        checkOut: '—',
        workedHours: '0.00',
        status: 'Absent',
    },
];
