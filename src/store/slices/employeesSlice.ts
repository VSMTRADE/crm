import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employeesService, Employee, EmployeeFormData } from '../../services/employeesService';

interface EmployeesState {
  employees: Employee[];
  managers: Employee[];
  selectedEmployee: Employee | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: EmployeesState = {
  employees: [],
  managers: [],
  selectedEmployee: null,
  isLoading: false,
  error: null,
};

export const fetchEmployeesAsync = createAsyncThunk(
  'employees/fetchEmployees',
  async () => {
    return await employeesService.getEmployees();
  }
);

export const fetchManagersAsync = createAsyncThunk(
  'employees/fetchManagers',
  async () => {
    return await employeesService.getManagers();
  }
);

export const fetchEmployeeByIdAsync = createAsyncThunk(
  'employees/fetchEmployeeById',
  async (id: string) => {
    return await employeesService.getEmployeeById(id);
  }
);

export const createEmployeeAsync = createAsyncThunk(
  'employees/createEmployee',
  async (employee: EmployeeFormData) => {
    return await employeesService.createEmployee(employee);
  }
);

export const updateEmployeeAsync = createAsyncThunk(
  'employees/updateEmployee',
  async ({ id, employee }: { id: string; employee: Partial<EmployeeFormData> }) => {
    return await employeesService.updateEmployee(id, employee);
  }
);

export const deleteEmployeeAsync = createAsyncThunk(
  'employees/deleteEmployee',
  async (id: string) => {
    await employeesService.deleteEmployee(id);
    return id;
  }
);

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Employees
      .addCase(fetchEmployeesAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployeesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployeesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch employees';
      })
      // Fetch Managers
      .addCase(fetchManagersAsync.fulfilled, (state, action) => {
        state.managers = action.payload;
      })
      // Fetch Employee by ID
      .addCase(fetchEmployeeByIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedEmployee = action.payload;
      })
      .addCase(fetchEmployeeByIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch employee';
      })
      // Create Employee
      .addCase(createEmployeeAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEmployeeAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employees.unshift(action.payload);
      })
      .addCase(createEmployeeAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create employee';
      })
      // Update Employee
      .addCase(updateEmployeeAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEmployeeAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.employees.findIndex((emp) => emp.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
      })
      .addCase(updateEmployeeAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update employee';
      })
      // Delete Employee
      .addCase(deleteEmployeeAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteEmployeeAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employees = state.employees.filter((emp) => emp.id !== action.payload);
      })
      .addCase(deleteEmployeeAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete employee';
      });
  },
});

export const { clearSelectedEmployee, clearError } = employeesSlice.actions;
export default employeesSlice.reducer;
