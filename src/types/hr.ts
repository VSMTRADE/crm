export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  birth_date: string;
  hire_date: string;
  position: string;
  department: string;
  salary: number;
  manager_id?: string;
  status: 'active' | 'inactive' | 'on_leave';
  created_at?: string;
  updated_at?: string;
}

export interface Vacation {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  type: 'vacation' | 'sick_leave' | 'personal_leave' | 'maternity_leave' | 'paternity_leave';
  description?: string;
  created_at?: string;
  updated_at?: string;
  employee?: Employee;
}

export interface TimeEntry {
  id: string;
  employee_id: string;
  date: string;
  check_in: string;
  check_out: string;
  break_start?: string;
  break_end?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  employee?: Employee;
}

export interface Benefit {
  id: string;
  name: string;
  description: string;
  type: 'health' | 'dental' | 'vision' | 'life_insurance' | 'other';
  cost: number;
  provider: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeBenefit {
  id: string;
  employee_id: string;
  benefit_id: string;
  start_date: string;
  end_date?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  employee?: Employee;
  benefit?: Benefit;
}

export interface Document {
  id: string;
  employee_id: string;
  name: string;
  type: 'contract' | 'id' | 'certificate' | 'other';
  file_url: string;
  upload_date: string;
  expiry_date?: string;
  status: 'active' | 'archived';
  created_at?: string;
  updated_at?: string;
  employee?: Employee;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  manager?: Employee;
}

export interface Position {
  id: string;
  name: string;
  department_id: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  department?: Department;
}
