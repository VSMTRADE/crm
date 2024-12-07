-- Drop existing policies
DROP POLICY IF EXISTS benefits_policy ON benefits;

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_benefits_updated_at ON benefits;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Recreate the benefits table
DROP TABLE IF EXISTS benefits;
CREATE TABLE benefits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    type VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_benefits_employee_id ON benefits(employee_id);
CREATE INDEX IF NOT EXISTS idx_benefits_created_at ON benefits(created_at DESC);

-- Enable RLS
ALTER TABLE benefits ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Enable read for authenticated users" 
    ON benefits FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Enable insert for authenticated users" 
    ON benefits FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" 
    ON benefits FOR UPDATE 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" 
    ON benefits FOR DELETE 
    TO authenticated 
    USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON benefits
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Grant permissions to authenticated users
GRANT ALL ON benefits TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
