import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as hrService from '../../services/hrService';
import { Employee, Vacation, TimeEntry, Benefit, Document, Department, Position, EmployeeBenefit } from '../../types/hr';

interface HRState {
  employees: {
    items: Employee[];
    loading: boolean;
    error: string | null;
  };
  vacations: {
    items: Vacation[];
    loading: boolean;
    error: string | null;
  };
  timeEntries: {
    items: TimeEntry[];
    loading: boolean;
    error: string | null;
  };
  benefits: {
    items: Benefit[];
    loading: boolean;
    error: string | null;
  };
  employeeBenefits: {
    items: EmployeeBenefit[];
    loading: boolean;
    error: string | null;
  };
  documents: {
    items: Document[];
    loading: boolean;
    error: string | null;
  };
  departments: {
    items: Department[];
    loading: boolean;
    error: string | null;
  };
  positions: {
    items: Position[];
    loading: boolean;
    error: string | null;
  };
}

const initialState: HRState = {
  employees: { items: [], loading: false, error: null },
  vacations: { items: [], loading: false, error: null },
  timeEntries: { items: [], loading: false, error: null },
  benefits: { items: [], loading: false, error: null },
  employeeBenefits: { items: [], loading: false, error: null },
  documents: { items: [], loading: false, error: null },
  departments: { items: [], loading: false, error: null },
  positions: { items: [], loading: false, error: null },
};

// Employees
export const fetchEmployees = createAsyncThunk(
  'hr/fetchEmployees',
  async () => {
    const response = await hrService.getEmployees();
    return response.data;
  }
);

export const createEmployee = createAsyncThunk(
  'hr/createEmployee',
  async (employee: Omit<Employee, 'id'>) => {
    const response = await hrService.createEmployee(employee);
    return response.data;
  }
);

export const updateEmployee = createAsyncThunk(
  'hr/updateEmployee',
  async ({ id, data }: { id: string; data: Partial<Employee> }) => {
    const response = await hrService.updateEmployee(id, data);
    return response.data;
  }
);

export const deleteEmployee = createAsyncThunk(
  'hr/deleteEmployee',
  async (id: string) => {
    await hrService.deleteEmployee(id);
    return id;
  }
);

// Vacations
export const fetchVacations = createAsyncThunk(
  'hr/fetchVacations',
  async () => {
    const response = await hrService.getVacations();
    return response.data;
  }
);

export const createVacation = createAsyncThunk(
  'hr/createVacation',
  async (vacation: Omit<Vacation, 'id'>) => {
    const response = await hrService.createVacation(vacation);
    return response.data;
  }
);

export const updateVacation = createAsyncThunk(
  'hr/updateVacation',
  async ({ id, data }: { id: string; data: Partial<Vacation> }) => {
    const response = await hrService.updateVacation(id, data);
    return response.data;
  }
);

export const deleteVacation = createAsyncThunk(
  'hr/deleteVacation',
  async (id: string) => {
    await hrService.deleteVacation(id);
    return id;
  }
);

// Time Entries
export const fetchTimeEntries = createAsyncThunk(
  'hr/fetchTimeEntries',
  async () => {
    const response = await hrService.getTimeEntries();
    return response.data;
  }
);

export const createTimeEntry = createAsyncThunk(
  'hr/createTimeEntry',
  async (timeEntry: Omit<TimeEntry, 'id'>) => {
    const response = await hrService.createTimeEntry(timeEntry);
    return response.data;
  }
);

export const updateTimeEntry = createAsyncThunk(
  'hr/updateTimeEntry',
  async ({ id, data }: { id: string; data: Partial<TimeEntry> }) => {
    const response = await hrService.updateTimeEntry(id, data);
    return response.data;
  }
);

// Benefits
export const fetchBenefits = createAsyncThunk(
  'hr/fetchBenefits',
  async () => {
    const response = await hrService.getBenefits();
    return response.data;
  }
);

export const createBenefit = createAsyncThunk(
  'hr/createBenefit',
  async (benefit: Omit<Benefit, 'id'>) => {
    const response = await hrService.createBenefit(benefit);
    return response.data;
  }
);

export const updateBenefit = createAsyncThunk(
  'hr/updateBenefit',
  async ({ id, data }: { id: string; data: Partial<Benefit> }) => {
    const response = await hrService.updateBenefit(id, data);
    return response.data;
  }
);

// Documents
export const fetchDocuments = createAsyncThunk(
  'hr/fetchDocuments',
  async () => {
    const response = await hrService.getDocuments();
    return response.data;
  }
);

export const createDocument = createAsyncThunk(
  'hr/createDocument',
  async (formData: FormData) => {
    const response = await hrService.createDocument(formData);
    return response.data;
  }
);

export const updateDocument = createAsyncThunk(
  'hr/updateDocument',
  async ({ id, data }: { id: string; data: Partial<Document> }) => {
    const response = await hrService.updateDocument(id, data);
    return response.data;
  }
);

const hrSlice = createSlice({
  name: 'hr',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Employees
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.employees.loading = true;
        state.employees.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.employees.loading = false;
        state.employees.items = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.employees.loading = false;
        state.employees.error = action.error.message || 'Failed to fetch employees';
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.employees.items.push(action.payload);
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const index = state.employees.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.employees.items[index] = action.payload;
        }
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.employees.items = state.employees.items.filter(item => item.id !== action.payload);
      })

      // Vacations
      .addCase(fetchVacations.pending, (state) => {
        state.vacations.loading = true;
        state.vacations.error = null;
      })
      .addCase(fetchVacations.fulfilled, (state, action) => {
        state.vacations.loading = false;
        state.vacations.items = action.payload;
      })
      .addCase(fetchVacations.rejected, (state, action) => {
        state.vacations.loading = false;
        state.vacations.error = action.error.message || 'Failed to fetch vacations';
      })
      .addCase(createVacation.pending, (state) => {
        state.vacations.loading = true;
        state.vacations.error = null;
      })
      .addCase(createVacation.fulfilled, (state, action) => {
        state.vacations.loading = false;
        state.vacations.items = [...state.vacations.items, action.payload];
      })
      .addCase(createVacation.rejected, (state, action) => {
        state.vacations.loading = false;
        state.vacations.error = action.error.message || 'Failed to create vacation';
      })
      .addCase(updateVacation.pending, (state) => {
        state.vacations.loading = true;
        state.vacations.error = null;
      })
      .addCase(updateVacation.fulfilled, (state, action) => {
        state.vacations.loading = false;
        const index = state.vacations.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.vacations.items[index] = action.payload;
        }
      })
      .addCase(updateVacation.rejected, (state, action) => {
        state.vacations.loading = false;
        state.vacations.error = action.error.message || 'Failed to update vacation';
      })
      .addCase(deleteVacation.fulfilled, (state, action) => {
        state.vacations.items = state.vacations.items.filter(item => item.id !== action.payload);
      })

      // Time Entries
      .addCase(fetchTimeEntries.pending, (state) => {
        state.timeEntries.loading = true;
        state.timeEntries.error = null;
      })
      .addCase(fetchTimeEntries.fulfilled, (state, action) => {
        state.timeEntries.loading = false;
        state.timeEntries.items = action.payload;
      })
      .addCase(fetchTimeEntries.rejected, (state, action) => {
        state.timeEntries.loading = false;
        state.timeEntries.error = action.error.message || 'Failed to fetch time entries';
      })
      .addCase(createTimeEntry.fulfilled, (state, action) => {
        state.timeEntries.items.push(action.payload);
      })
      .addCase(updateTimeEntry.fulfilled, (state, action) => {
        const index = state.timeEntries.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.timeEntries.items[index] = action.payload;
        }
      })

      // Benefits
      .addCase(fetchBenefits.pending, (state) => {
        state.benefits.loading = true;
        state.benefits.error = null;
      })
      .addCase(fetchBenefits.fulfilled, (state, action) => {
        state.benefits.loading = false;
        state.benefits.items = action.payload;
      })
      .addCase(fetchBenefits.rejected, (state, action) => {
        state.benefits.loading = false;
        state.benefits.error = action.error.message || 'Failed to fetch benefits';
      })
      .addCase(createBenefit.fulfilled, (state, action) => {
        state.benefits.items.push(action.payload);
      })
      .addCase(updateBenefit.fulfilled, (state, action) => {
        const index = state.benefits.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.benefits.items[index] = action.payload;
        }
      })

      // Documents
      .addCase(fetchDocuments.pending, (state) => {
        state.documents.loading = true;
        state.documents.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.documents.loading = false;
        state.documents.items = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.documents.loading = false;
        state.documents.error = action.error.message || 'Failed to fetch documents';
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.documents.items.push(action.payload);
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        const index = state.documents.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.documents.items[index] = action.payload;
        }
      });
  },
});

export default hrSlice.reducer;
