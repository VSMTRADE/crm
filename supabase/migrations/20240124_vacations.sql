-- Create vacations table
CREATE TABLE IF NOT EXISTS vacations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('vacation', 'sick_leave', 'personal_leave', 'maternity_leave', 'paternity_leave')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on employee_id for faster lookups
CREATE INDEX vacations_employee_id_idx ON vacations(employee_id);

-- Enable RLS
ALTER TABLE vacations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON vacations;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON vacations;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON vacations;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON vacations;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users" ON vacations
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = vacations.employee_id 
    AND e.user_id = auth.uid()
  ));

CREATE POLICY "Enable insert access for authenticated users" ON vacations
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = employee_id 
    AND e.user_id = auth.uid()
  ));

CREATE POLICY "Enable update access for authenticated users" ON vacations
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = employee_id 
    AND e.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = employee_id 
    AND e.user_id = auth.uid()
  ));

CREATE POLICY "Enable delete access for authenticated users" ON vacations
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.id = employee_id 
    AND e.user_id = auth.uid()
  ));

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_vacations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to call the function before update
CREATE TRIGGER update_vacations_updated_at
  BEFORE UPDATE ON vacations
  FOR EACH ROW
  EXECUTE FUNCTION update_vacations_updated_at();
