import { supabase } from '../config/supabase';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

class UsersService {
  async fetchUsers(): Promise<User[]> {
    // Get all users from profiles table
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url')
      .order('full_name');

    if (error) throw error;
    
    return users || [];
  }
}

export const usersService = new UsersService();
