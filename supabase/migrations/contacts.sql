-- Create contacts table
CREATE TABLE contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    type TEXT CHECK (type IN ('lead', 'cliente', 'parceiro')) NOT NULL,
    status TEXT CHECK (status IN ('active', 'inactive')) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read for authenticated users" ON contacts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON contacts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON contacts
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON contacts
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert sample data
INSERT INTO contacts (name, email, phone, company, type, status) VALUES
    ('João Silva', 'joao.silva@email.com', '(11) 98765-4321', 'Empresa ABC', 'cliente', 'active'),
    ('Maria Santos', 'maria.santos@email.com', '(11) 91234-5678', 'Empresa XYZ', 'lead', 'active'),
    ('Pedro Oliveira', 'pedro.oliveira@email.com', '(11) 97777-8888', 'Empresa 123', 'parceiro', 'active');
