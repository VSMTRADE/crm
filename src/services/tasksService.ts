import { supabase } from '../config/supabase';
import { GetState } from '../store';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  completed_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  contact_id?: string;
  deal_id?: string;
  assigned_to_user?: string;
  assigned_to_contact?: string;
  assignedUser?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  due_date?: string;
  contact_id?: string;
  deal_id?: string;
  assigned_to_user?: string;
  assigned_to_contact?: string;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string;
  completed_at?: string;
}

class TasksService {
  async createTask(input: CreateTaskInput, getState: GetState): Promise<Task> {
    const userId = getState().auth.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const taskData = {
      ...input,
      created_by: userId,
      status: input.status || 'pending',
      priority: input.priority || 'medium',
      assigned_to_user: input.assigned_to_user || null,
      assigned_to_contact: input.assigned_to_contact || null
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateTask(input: UpdateTaskInput): Promise<Task> {
    const { id, ...updateData } = input;

    // Convert empty strings to null for foreign key fields
    const taskData = {
      ...updateData,
      assigned_to_user: updateData.assigned_to_user || null,
      assigned_to_contact: updateData.assigned_to_contact || null
    };

    const { data, error } = await supabase
      .from('tasks')
      .update(taskData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getTasks(getState: GetState): Promise<Task[]> {
    const userId = getState().auth.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        *,
        assignedUser:profiles!tasks_assigned_to_user_fkey(
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .or(`created_by.eq.${userId},assigned_to_user.eq.${userId}`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (tasksError) throw tasksError;
    return tasks || [];
  }

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  async fetchTasks(getState: GetState): Promise<Task[]> {
    const userId = getState().auth.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // First, fetch the tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .or(`created_by.eq.${userId},assigned_to_user.eq.${userId},assigned_to_contact.eq.${userId}`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (tasksError) {
      throw tasksError;
    }

    // Then, fetch the users for tasks that have assignments
    const assignedUserIds = tasks
      ?.filter(task => task.assigned_to_user)
      .map(task => task.assigned_to_user) || [];

    if (assignedUserIds.length === 0) {
      return tasks || [];
    }

    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url')
      .in('id', assignedUserIds);

    if (usersError) {
      throw usersError;
    }

    // Map users to a dictionary for easy lookup
    const userMap = new Map(
      users?.map(user => [
        user.id,
        {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          avatar_url: user.avatar_url
        }
      ])
    );

    // Combine tasks with user information
    return (tasks || []).map(task => ({
      ...task,
      assignedUser: task.assigned_to_user ? userMap.get(task.assigned_to_user) : undefined
    }));
  }

  async completeTask(id: string): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async reopenTask(id: string): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        status: 'pending',
        completed_at: null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}

export const tasksService = new TasksService();
