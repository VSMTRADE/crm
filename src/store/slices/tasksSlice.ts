import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, CreateTaskInput, UpdateTaskInput, tasksService } from '../../services/tasksService';
import { RootState } from '..';

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchTasksAsync = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { getState }) => {
    return await tasksService.fetchTasks(getState as any);
  }
);

export const createTaskAsync = createAsyncThunk(
  'tasks/createTask',
  async (input: CreateTaskInput, { getState }) => {
    return await tasksService.createTask(input, getState as any);
  }
);

export const updateTaskAsync = createAsyncThunk(
  'tasks/updateTask',
  async (input: UpdateTaskInput) => {
    return await tasksService.updateTask(input);
  }
);

export const deleteTaskAsync = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string) => {
    await tasksService.deleteTask(id);
    return id;
  }
);

export const completeTaskAsync = createAsyncThunk(
  'tasks/completeTask',
  async (id: string) => {
    return await tasksService.completeTask(id);
  }
);

export const reopenTaskAsync = createAsyncThunk(
  'tasks/reopenTask',
  async (id: string) => {
    return await tasksService.reopenTask(id);
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch tasks
    builder.addCase(fetchTasksAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTasksAsync.fulfilled, (state, action) => {
      state.loading = false;
      state.tasks = action.payload;
    });
    builder.addCase(fetchTasksAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch tasks';
    });

    // Create task
    builder.addCase(createTaskAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createTaskAsync.fulfilled, (state, action) => {
      state.loading = false;
      state.tasks.unshift(action.payload);
    });
    builder.addCase(createTaskAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create task';
    });

    // Update task
    builder.addCase(updateTaskAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateTaskAsync.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.tasks.findIndex((task) => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    });
    builder.addCase(updateTaskAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to update task';
    });

    // Delete task
    builder.addCase(deleteTaskAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteTaskAsync.fulfilled, (state, action) => {
      state.loading = false;
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);
    });
    builder.addCase(deleteTaskAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to delete task';
    });

    // Complete task
    builder.addCase(completeTaskAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(completeTaskAsync.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.tasks.findIndex((task) => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    });
    builder.addCase(completeTaskAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to complete task';
    });

    // Reopen task
    builder.addCase(reopenTaskAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(reopenTaskAsync.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.tasks.findIndex((task) => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    });
    builder.addCase(reopenTaskAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to reopen task';
    });
  },
});

export const { clearError } = tasksSlice.actions;
export default tasksSlice.reducer;

// Selectors
export const selectTasks = (state: RootState) => state.tasks.tasks;
export const selectTasksLoading = (state: RootState) => state.tasks.loading;
export const selectTasksError = (state: RootState) => state.tasks.error;
