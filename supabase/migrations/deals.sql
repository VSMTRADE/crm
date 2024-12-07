-- Create deals table
CREATE TABLE deals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    value DECIMAL(10,2),
    status TEXT CHECK (status IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')) NOT NULL DEFAULT 'prospecting',
    contact_id UUID REFERENCES contacts(id),
    responsible_id UUID REFERENCES auth.users(id),
    expected_close_date DATE,
    probability INTEGER CHECK (probability >= 0 AND probability <= 100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read for authenticated users" ON deals
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON deals
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON deals
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON deals
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_deals_updated_at
    BEFORE UPDATE ON deals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample deals
INSERT INTO deals (title, description, value, status, probability, expected_close_date)
VALUES 
    ('Projeto Website E-commerce', 'Desenvolvimento de loja virtual completa', 50000.00, 'proposal', 70, CURRENT_DATE + INTERVAL '30 days'),
    ('Consultoria ERP', 'Implementação de sistema integrado', 75000.00, 'qualification', 50, CURRENT_DATE + INTERVAL '60 days'),
    ('Manutenção Sistemas', 'Contrato anual de manutenção', 36000.00, 'negotiation', 85, CURRENT_DATE + INTERVAL '15 days');
