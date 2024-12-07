-- Drop table if exists (para evitar conflitos)
DROP TABLE IF EXISTS calendar_events;
DROP TYPE IF EXISTS event_type;
DROP FUNCTION IF EXISTS trigger_set_updated_at();

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar enum para tipos de eventos
CREATE TYPE event_type AS ENUM ('task', 'meeting', 'meet_meeting', 'reminder');

-- Criar tabela de eventos
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    all_day BOOLEAN DEFAULT false,
    type event_type NOT NULL DEFAULT 'meeting',
    meet_link TEXT,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    task_id UUID REFERENCES tasks(id),
    contact_id UUID REFERENCES contacts(id),
    deal_id UUID REFERENCES deals(id)
);

-- Adicionar RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own events" ON calendar_events;
    DROP POLICY IF EXISTS "Users can insert their own events" ON calendar_events;
    DROP POLICY IF EXISTS "Users can update their own events" ON calendar_events;
    DROP POLICY IF EXISTS "Users can delete their own events" ON calendar_events;
END $$;

CREATE POLICY "Users can view their own events"
    ON calendar_events FOR SELECT
    USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own events"
    ON calendar_events FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own events"
    ON calendar_events FOR UPDATE
    USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own events"
    ON calendar_events FOR DELETE
    USING (auth.uid() = created_by);

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS set_updated_at ON calendar_events;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();
