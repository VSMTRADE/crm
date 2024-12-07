import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../services/supabase';

// Types
interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  status: string;
}

interface Vacation {
  id: number;
  employeeId: number;
  startDate: string;
  endDate: string;
  type: string;
  status: string;
  notes?: string;
}

interface TimeEntry {
  id: number;
  employeeId: number;
  checkIn: string;
  checkOut?: string;
  breakStart?: string;
  breakEnd?: string;
  notes?: string;
}

interface Benefit {
  id: string;
  employee_id: string;
  type: string;
  provider: string;
  cost: number;
  start_date: string;
  end_date?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
}

interface Document {
  id: number;
  employeeId: number;
  type: string;
  description: string;
  fileUrl: string;
  uploadDate: string;
  expiryDate?: string;
}

interface HRState {
  employees: Employee[];
  vacations: Vacation[];
  timeEntries: TimeEntry[];
  benefits: Benefit[];
  documents: Document[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: HRState = {
  employees: [],
  vacations: [],
  timeEntries: [],
  benefits: [],
  documents: [],
  loading: false,
  error: null,
};

// Thunks
export const fetchEmployees = createAsyncThunk(
  'hr/fetchEmployees',
  async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('first_name', { ascending: true });
    
    if (error) throw error;
    return data;
  }
);

export const createEmployee = createAsyncThunk(
  'hr/createEmployee',
  async (employee: Partial<Employee>) => {
    const { data, error } = await supabase
      .from('employees')
      .insert([employee])
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  }
);

export const updateEmployee = createAsyncThunk(
  'hr/updateEmployee',
  async ({ id, ...data }: Partial<Employee> & { id: string }) => {
    const { data: updatedEmployee, error } = await supabase
      .from('employees')
      .update(data)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) throw error;
    return updatedEmployee;
  }
);

export const deleteEmployee = createAsyncThunk(
  'hr/deleteEmployee',
  async (id: string) => {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return id;
  }
);

export const fetchVacations = createAsyncThunk(
  'hr/fetchVacations',
  async () => {
    const { data, error } = await supabase
      .from('vacations')
      .select('*');
    
    if (error) throw error;
    return data;
  }
);

export const addVacation = createAsyncThunk(
  'hr/addVacation',
  async (vacation: Partial<Vacation>) => {
    const { data, error } = await supabase
      .from('vacations')
      .insert([vacation])
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  }
);

export const updateVacation = createAsyncThunk(
  'hr/updateVacation',
  async ({ id, ...data }: Partial<Vacation> & { id: number }) => {
    const { data: updatedVacation, error } = await supabase
      .from('vacations')
      .update(data)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) throw error;
    return updatedVacation;
  }
);

export const deleteVacation = createAsyncThunk(
  'hr/deleteVacation',
  async (id: number) => {
    const { error } = await supabase
      .from('vacations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return id;
  }
);

// Time entries thunks
export const fetchTimeEntries = createAsyncThunk(
  'hr/fetchTimeEntries',
  async () => {
    const { data, error } = await supabase
      .from('time-entries')
      .select('*');
    
    if (error) throw error;
    return data;
  }
);

export const createTimeEntry = createAsyncThunk(
  'hr/createTimeEntry',
  async (timeEntry: Partial<TimeEntry>) => {
    const { data, error } = await supabase
      .from('time-entries')
      .insert([timeEntry])
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  }
);

export const updateTimeEntry = createAsyncThunk(
  'hr/updateTimeEntry',
  async ({ id, ...data }: Partial<TimeEntry> & { id: number }) => {
    const { data: updatedTimeEntry, error } = await supabase
      .from('time-entries')
      .update(data)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) throw error;
    return updatedTimeEntry;
  }
);

export const deleteTimeEntry = createAsyncThunk(
  'hr/deleteTimeEntry',
  async (id: number) => {
    const { error } = await supabase
      .from('time-entries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return id;
  }
);

// Benefits thunks
export const fetchBenefits = createAsyncThunk(
  'hr/fetchBenefits',
  async (_, { rejectWithValue }) => {
    try {
      const { data: benefits, error: benefitsError } = await supabase
        .from('benefits')
        .select(`
          *,
          employee:employees (
            id,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (benefitsError) {
        console.error('Error fetching benefits:', benefitsError);
        throw benefitsError;
      }

      return benefits;
    } catch (error: any) {
      console.error('Error in fetchBenefits:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const createBenefit = createAsyncThunk(
  'hr/createBenefit',
  async (benefit: Partial<Benefit>, { rejectWithValue }) => {
    try {
      console.log('Creating benefit with data:', benefit);
      
      // Format the data for insertion
      const benefitData = {
        employee_id: benefit.employee_id,
        type: benefit.type?.trim(),
        provider: benefit.provider?.trim(),
        cost: Number(benefit.cost),
        start_date: benefit.start_date,
        end_date: benefit.end_date || null,
        description: benefit.description?.trim() || null
      };

      // Validate required fields
      if (!benefitData.employee_id || !benefitData.type || !benefitData.provider || 
          !benefitData.cost || !benefitData.start_date) {
        const error = {
          message: 'Missing required fields',
          details: `Required: employee_id, type, provider, cost, start_date`
        };
        console.error('Validation error:', error);
        return rejectWithValue(error);
      }

      // Validate cost is a positive number
      if (isNaN(benefitData.cost) || benefitData.cost <= 0) {
        const error = {
          message: 'Invalid cost value',
          details: 'Cost must be a positive number'
        };
        console.error('Validation error:', error);
        return rejectWithValue(error);
      }

      console.log('Inserting benefit with data:', benefitData);

      // Insert the benefit
      const { data, error: insertError } = await supabase
        .from('benefits')
        .insert([benefitData])
        .select(`
          id,
          employee_id,
          type,
          provider,
          cost,
          start_date,
          end_date,
          description,
          created_at,
          updated_at,
          employee:employees (
            id,
            first_name,
            last_name
          )
        `)
        .single();

      if (insertError) {
        console.error('Error inserting benefit:', insertError);
        return rejectWithValue({
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });
      }

      if (!data) {
        const error = {
          message: 'Failed to create benefit',
          details: 'No data returned from the server'
        };
        console.error('Insert error:', error);
        return rejectWithValue(error);
      }

      console.log('Benefit created successfully:', data);
      return data;
    } catch (error: any) {
      console.error('Unexpected error in createBenefit:', error);
      return rejectWithValue({
        message: 'An unexpected error occurred',
        details: error.message
      });
    }
  }
);

export const updateBenefit = createAsyncThunk(
  'hr/updateBenefit',
  async ({ id, ...benefit }: Partial<Benefit> & { id: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('benefits')
        .update({
          employee_id: benefit.employee_id,
          type: benefit.type,
          provider: benefit.provider,
          cost: benefit.cost,
          start_date: benefit.start_date,
          end_date: benefit.end_date,
          description: benefit.description
        })
        .eq('id', id)
        .select(`
          *,
          employee:employees (
            id,
            first_name,
            last_name
          )
        `)
        .single();

      if (error) {
        console.error('Error updating benefit:', error);
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Error in updateBenefit:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteBenefit = createAsyncThunk(
  'hr/deleteBenefit',
  async (id: string) => {
    const { error } = await supabase
      .from('benefits')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return id;
  }
);

// Documents thunks
export const fetchDocuments = createAsyncThunk(
  'hr/fetchDocuments',
  async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*');
    
    if (error) throw error;
    return data;
  }
);

export const createDocument = createAsyncThunk(
  'hr/createDocument',
  async (document: FormData) => {
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(document.get('file') as string, document);
    
    if (error) throw error;
    return data;
  }
);

export const updateDocument = createAsyncThunk(
  'hr/updateDocument',
  async ({ id, data }: { id: number; data: FormData }) => {
    const { error } = await supabase.storage
      .from('documents')
      .update(id.toString(), data);
    
    if (error) throw error;
    return id;
  }
);

export const deleteDocument = createAsyncThunk(
  'hr/deleteDocument',
  async (id: number) => {
    const { error } = await supabase.storage
      .from('documents')
      .remove([id.toString()]);
    
    if (error) throw error;
    return id;
  }
);

// Slice
const hrSlice = createSlice({
  name: 'hr',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Employee reducers
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch employees';
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.employees.push(action.payload);
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const index = state.employees.findIndex(emp => emp.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
      })
      // Vacation reducers
      .addCase(fetchVacations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVacations.fulfilled, (state, action) => {
        state.loading = false;
        state.vacations = action.payload;
      })
      .addCase(fetchVacations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch vacations';
      })
      .addCase(addVacation.fulfilled, (state, action) => {
        state.vacations.push(action.payload);
      })
      .addCase(updateVacation.fulfilled, (state, action) => {
        const index = state.vacations.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.vacations[index] = action.payload;
        }
      })
      .addCase(deleteVacation.fulfilled, (state, action) => {
        state.vacations = state.vacations.filter(v => v.id !== action.payload);
      })
      // Time Entry reducers
      .addCase(fetchTimeEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTimeEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.timeEntries = action.payload;
      })
      .addCase(fetchTimeEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch time entries';
      })
      .addCase(createTimeEntry.fulfilled, (state, action) => {
        state.timeEntries.push(action.payload);
      })
      .addCase(updateTimeEntry.fulfilled, (state, action) => {
        const index = state.timeEntries.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.timeEntries[index] = action.payload;
        }
      })
      .addCase(deleteTimeEntry.fulfilled, (state, action) => {
        state.timeEntries = state.timeEntries.filter(t => t.id !== action.payload);
      })
      // Benefits reducers
      .addCase(fetchBenefits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBenefits.fulfilled, (state, action) => {
        state.loading = false;
        state.benefits = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchBenefits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch benefits';
      })
      .addCase(createBenefit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBenefit.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.benefits = Array.isArray(state.benefits) ? [...state.benefits, action.payload] : [action.payload];
        }
        state.error = null;
      })
      .addCase(createBenefit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create benefit';
      })
      .addCase(updateBenefit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBenefit.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.benefits.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.benefits[index] = action.payload;
        }
      })
      .addCase(updateBenefit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update benefit';
      })
      .addCase(deleteBenefit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBenefit.fulfilled, (state, action) => {
        state.loading = false;
        state.benefits = state.benefits.filter(b => b.id !== action.payload);
      })
      .addCase(deleteBenefit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete benefit';
      });
  },
});

export default hrSlice.reducer;
