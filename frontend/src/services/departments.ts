import { employeesApi } from './employees';

export interface DepartmentSummary {
  name: string;
  headcount: number;
  active: boolean;
}

export const departmentsApi = {
  list: async (): Promise<DepartmentSummary[]> => {
    const employees = await employeesApi.list();
    const map = new Map<string, number>();

    for (const emp of employees) {
      const dept = emp.department || 'General';
      map.set(dept, (map.get(dept) || 0) + 1);
    }

    return Array.from(map.entries()).map(([name, headcount]) => ({
      name,
      headcount,
      active: true,
    }));
  },
};
