-- Adicionar colunas de atribuição na tabela tasks
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS assigned_to_user UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS assigned_to_contact UUID REFERENCES contacts(id);

-- Atualizar a constraint para incluir ambos os campos
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS one_assignee_only;
ALTER TABLE tasks ADD CONSTRAINT one_assignee_only
    CHECK (
        (assigned_to_user IS NULL AND assigned_to_contact IS NOT NULL) OR
        (assigned_to_user IS NOT NULL AND assigned_to_contact IS NULL) OR
        (assigned_to_user IS NULL AND assigned_to_contact IS NULL)
    );

-- Atualizar as políticas de segurança para incluir assigned_to_user
DROP POLICY IF EXISTS "Users can view their own tasks or tasks assigned to them" ON tasks;
CREATE POLICY "Users can view their own tasks or tasks assigned to them"
    ON tasks FOR SELECT
    USING (
        auth.uid() = created_by 
        OR auth.uid() = assigned_to_user
    );

DROP POLICY IF EXISTS "Users can update tasks they created or are assigned to" ON tasks;
CREATE POLICY "Users can update tasks they created or are assigned to"
    ON tasks FOR UPDATE
    USING (
        auth.uid() = created_by 
        OR auth.uid() = assigned_to_user
    );
