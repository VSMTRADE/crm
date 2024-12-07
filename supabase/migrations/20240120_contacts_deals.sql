-- Drop existing tables if they exist
DROP TABLE IF EXISTS deals;
DROP TABLE IF EXISTS contacts;

-- Create contacts table first
CREATE TABLE contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    type TEXT CHECK (type IN ('lead', 'cliente', 'parceiro')) NOT NULL,
    status TEXT CHECK (status IN ('active', 'inactive')) NOT NULL DEFAULT 'active',
    source TEXT CHECK (source IN ('website', 'referral', 'social_media', 'email', 'phone', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id)
);

-- Create deals table with foreign key to contacts
CREATE TABLE deals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    value DECIMAL(10,2),
    status TEXT CHECK (status IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')) NOT NULL DEFAULT 'prospecting',
    contact_id UUID REFERENCES contacts(id),
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id),
    expected_close_date DATE,
    probability INTEGER CHECK (probability >= 0 AND probability <= 100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Create policies for contacts
CREATE POLICY "Users can view their own contacts"
    ON contacts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts"
    ON contacts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
    ON contacts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
    ON contacts FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for deals
CREATE POLICY "Users can view their own deals"
    ON deals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deals"
    ON deals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deals"
    ON deals FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deals"
    ON deals FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_type ON contacts(type);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_source ON contacts(source);

CREATE INDEX idx_deals_user_id ON deals(user_id);
CREATE INDEX idx_deals_contact_id ON deals(contact_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_expected_close_date ON deals(expected_close_date);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for both tables
CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at
    BEFORE UPDATE ON deals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample contacts with current user id
INSERT INTO contacts (name, email, phone, company, type, status, source, user_id)
SELECT 
    unnest(ARRAY['João Silva', 'Maria Santos', 'Pedro Oliveira']),
    unnest(ARRAY['joao.silva@email.com', 'maria.santos@email.com', 'pedro.oliveira@email.com']),
    unnest(ARRAY['(11) 98765-4321', '(11) 91234-5678', '(11) 97777-8888']),
    unnest(ARRAY['Empresa ABC', 'Empresa XYZ', 'Empresa 123']),
    unnest(ARRAY['cliente', 'lead', 'parceiro']),
    'active',
    unnest(ARRAY['website', 'referral', 'social_media']),
    auth.uid();

-- Insert sample deals
INSERT INTO deals (title, description, value, status, probability, expected_close_date, contact_id, user_id)
SELECT 
    'Projeto Website E-commerce',
    'Desenvolvimento de loja virtual completa',
    50000.00,
    'proposal',
    70,
    CURRENT_DATE + INTERVAL '30 days',
    id,
    auth.uid()
FROM contacts
WHERE name = 'João Silva'
LIMIT 1;
