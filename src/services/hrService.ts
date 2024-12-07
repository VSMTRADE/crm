import { supabase } from '../lib/supabase';
import { Employee, Vacation, TimeEntry, Benefit, Document, Department, Position, EmployeeBenefit } from '../types/hr';

// Employees
export const getEmployees = async () => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('first_name');
  
  if (error) throw error;
  return { data };
};

export const getEmployee = async (id: number) => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return { data };
};

export const createEmployee = async (employee: Omit<Employee, 'id'>) => {
  const { data, error } = await supabase
    .from('employees')
    .insert([employee])
    .select()
    .single();
  
  if (error) throw error;
  return { data };
};

export const updateEmployee = async (id: number, employee: Partial<Employee>) => {
  const { data, error } = await supabase
    .from('employees')
    .update(employee)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return { data };
};

export const deleteEmployee = async (id: number) => {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Vacations
export const getVacations = async () => {
  const { data, error } = await supabase
    .from('vacations')
    .select(`
      *,
      employee:employees!employee_id (
        id,
        first_name,
        last_name
      )
    `)
    .order('start_date', { ascending: false });
  
  if (error) throw error;
  return { data };
};

export const getVacation = async (id: string) => {
  const { data, error } = await supabase
    .from('vacations')
    .select(`
      *,
      employee:employees!employee_id (
        id,
        first_name,
        last_name
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return { data };
};

export const createVacation = async (vacation: Omit<Vacation, 'id'>) => {
  console.log('Creating vacation with data:', vacation);
  const { data, error } = await supabase
    .from('vacations')
    .insert([vacation])
    .select(`
      *,
      employee:employees!employee_id (
        id,
        first_name,
        last_name
      )
    `)
    .single();
  
  if (error) {
    console.error('Error creating vacation:', error);
    throw error;
  }
  console.log('Vacation created successfully:', data);
  return { data };
};

export const updateVacation = async (id: string, vacation: Partial<Vacation>) => {
  console.log('Updating vacation with ID:', id, 'and data:', vacation);
  const { data, error } = await supabase
    .from('vacations')
    .update(vacation)
    .eq('id', id)
    .select(`
      *,
      employee:employees!employee_id (
        id,
        first_name,
        last_name
      )
    `)
    .single();
  
  if (error) {
    console.error('Error updating vacation:', error);
    throw error;
  }
  console.log('Vacation updated successfully:', data);
  return { data };
};

export const deleteVacation = async (id: number) => {
  const { error } = await supabase
    .from('vacations')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const getEmployeeVacations = async (employeeId: number) => {
  const { data, error } = await supabase
    .from('vacations')
    .select(`
      *,
      employee:employees!employee_id (
        id,
        first_name,
        last_name
      )
    `)
    .eq('employee_id', employeeId)
    .order('start_date', { ascending: false });
  
  if (error) throw error;
  return { data };
};

// Time Entries
export const getTimeEntries = async () => {
  const { data, error } = await supabase
    .from('time_entries')
    .select('*');
  
  if (error) throw error;
  return { data };
};

export const getTimeEntry = async (id: number) => {
  const { data, error } = await supabase
    .from('time_entries')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return { data };
};

export const createTimeEntry = async (timeEntry: Omit<TimeEntry, 'id'>) => {
  const { data, error } = await supabase
    .from('time_entries')
    .insert([timeEntry])
    .select()
    .single();
  
  if (error) throw error;
  return { data };
};

export const updateTimeEntry = async (id: number, timeEntry: Partial<TimeEntry>) => {
  const { data, error } = await supabase
    .from('time_entries')
    .update(timeEntry)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return { data };
};

export const deleteTimeEntry = async (id: number) => {
  const { error } = await supabase
    .from('time_entries')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const getEmployeeTimeEntries = async (employeeId: number) => {
  const { data, error } = await supabase
    .from('time_entries')
    .select('*')
    .eq('employee_id', employeeId);
  
  if (error) throw error;
  return { data };
};

// Benefits
export const getBenefits = async () => {
  const { data, error } = await supabase
    .from('benefits')
    .select('*');
  
  if (error) throw error;
  return { data };
};

export const getBenefit = async (id: number) => {
  const { data, error } = await supabase
    .from('benefits')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return { data };
};

export const createBenefit = async (benefit: Omit<Benefit, 'id'>) => {
  const { data, error } = await supabase
    .from('benefits')
    .insert([benefit])
    .select()
    .single();
  
  if (error) throw error;
  return { data };
};

export const updateBenefit = async (id: number, benefit: Partial<Benefit>) => {
  const { data, error } = await supabase
    .from('benefits')
    .update(benefit)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return { data };
};

export const deleteBenefit = async (id: number) => {
  const { error } = await supabase
    .from('benefits')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Employee Benefits
export const getEmployeeBenefits = async (employeeId: number) => {
  const { data, error } = await supabase
    .from('employee_benefits')
    .select(`
      *,
      benefit:benefits (
        id,
        name
      )
    `)
    .eq('employee_id', employeeId);
  
  if (error) throw error;
  return { data };
};

export const assignBenefitToEmployee = async (employeeId: number, employeeBenefit: Omit<EmployeeBenefit, 'id' | 'employeeId'>) => {
  const { data, error } = await supabase
    .from('employee_benefits')
    .insert([employeeBenefit])
    .select(`
      *,
      benefit:benefits (
        id,
        name
      )
    `)
    .single();
  
  if (error) throw error;
  return { data };
};

export const updateEmployeeBenefit = async (employeeId: number, benefitId: number, employeeBenefit: Partial<EmployeeBenefit>) => {
  const { data, error } = await supabase
    .from('employee_benefits')
    .update(employeeBenefit)
    .eq('employee_id', employeeId)
    .eq('benefit_id', benefitId)
    .select(`
      *,
      benefit:benefits (
        id,
        name
      )
    `)
    .single();
  
  if (error) throw error;
  return { data };
};

export const removeEmployeeBenefit = async (employeeId: number, benefitId: number) => {
  const { error } = await supabase
    .from('employee_benefits')
    .delete()
    .eq('employee_id', employeeId)
    .eq('benefit_id', benefitId);
  
  if (error) throw error;
};

// Documents
export const getDocuments = async () => {
  const { data, error } = await supabase
    .from('documents')
    .select('*');
  
  if (error) throw error;
  return { data };
};

export const getDocument = async (id: number) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return { data };
};

export const createDocument = async (document: FormData) => {
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(document.get('file') as string, document.get('file'));
  
  if (error) throw error;
  return { data };
};

export const updateDocument = async (id: number, document: Partial<Document>) => {
  const { data, error } = await supabase
    .from('documents')
    .update(document)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return { data };
};

export const deleteDocument = async (id: number) => {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const getEmployeeDocuments = async (employeeId: number) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('employee_id', employeeId);
  
  if (error) throw error;
  return { data };
};

// Departments
export const getDepartments = async () => {
  const { data, error } = await supabase
    .from('departments')
    .select('*');
  
  if (error) throw error;
  return { data };
};

export const getDepartment = async (id: number) => {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return { data };
};

export const createDepartment = async (department: Omit<Department, 'id'>) => {
  const { data, error } = await supabase
    .from('departments')
    .insert([department])
    .select()
    .single();
  
  if (error) throw error;
  return { data };
};

export const updateDepartment = async (id: number, department: Partial<Department>) => {
  const { data, error } = await supabase
    .from('departments')
    .update(department)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return { data };
};

export const deleteDepartment = async (id: number) => {
  const { error } = await supabase
    .from('departments')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Positions
export const getPositions = async () => {
  const { data, error } = await supabase
    .from('positions')
    .select('*');
  
  if (error) throw error;
  return { data };
};

export const getPosition = async (id: number) => {
  const { data, error } = await supabase
    .from('positions')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return { data };
};

export const createPosition = async (position: Omit<Position, 'id'>) => {
  const { data, error } = await supabase
    .from('positions')
    .insert([position])
    .select()
    .single();
  
  if (error) throw error;
  return { data };
};

export const updatePosition = async (id: number, position: Partial<Position>) => {
  const { data, error } = await supabase
    .from('positions')
    .update(position)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return { data };
};

export const deletePosition = async (id: number) => {
  const { error } = await supabase
    .from('positions')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
