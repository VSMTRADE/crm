import { supabase } from '../config/supabase';

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  hire_date: string;
  position: string;
  department: string;
  salary: number;
  status: 'active' | 'inactive' | 'on_leave';
  manager_id?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  hire_date: string;
  position: string;
  department: string;
  salary: number;
  status: 'active' | 'inactive' | 'on_leave';
  manager_id?: string;
}

class EmployeesService {
  async getEmployees() {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getEmployeeById(id: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createEmployee(employee: EmployeeFormData) {
    const { data, error } = await supabase
      .from('employees')
      .insert([employee])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateEmployee(id: string, employee: Partial<EmployeeFormData>) {
    const { data, error } = await supabase
      .from('employees')
      .update(employee)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteEmployee(id: string) {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getManagers() {
    const { data, error } = await supabase
      .from('employees')
      .select('id, first_name, last_name')
      .eq('status', 'active')
      .order('first_name');

    if (error) throw error;
    return data;
  }
}

export const employeesService = new EmployeesService();
