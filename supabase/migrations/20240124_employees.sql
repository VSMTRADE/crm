-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    hire_date DATE NOT NULL,
    position TEXT NOT NULL,
    department TEXT NOT NULL,
    salary DECIMAL(10,2),
    status TEXT CHECK (status IN ('active', 'inactive', 'on_leave')) NOT NULL DEFAULT 'active',
    manager_id UUID REFERENCES employees(id),
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view employees" ON employees;
DROP POLICY IF EXISTS "Users can create employees" ON employees;
DROP POLICY IF EXISTS "Users can update employees" ON employees;
DROP POLICY IF EXISTS "Users can delete employees" ON employees;
DROP POLICY IF EXISTS "Authenticated users can view employees" ON employees;

-- Create policies
CREATE POLICY "Authenticated users can view employees"
    ON employees FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create employees"
    ON employees FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update employees"
    ON employees FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Users can delete employees"
    ON employees FOR DELETE
    TO authenticated
    USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON employees(manager_id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
