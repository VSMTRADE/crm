-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    priority TEXT NOT NULL DEFAULT 'medium',
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    assigned_to_user UUID REFERENCES auth.users(id),
    assigned_to_contact UUID REFERENCES contacts(id),
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    contact_id UUID REFERENCES contacts(id),
    deal_id UUID REFERENCES deals(id),
    CONSTRAINT one_assignee_only CHECK (
        (assigned_to_user IS NULL AND assigned_to_contact IS NOT NULL) OR
        (assigned_to_user IS NOT NULL AND assigned_to_contact IS NULL) OR
        (assigned_to_user IS NULL AND assigned_to_contact IS NULL)
    )
);

-- Create RLS policies for tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy for viewing tasks (users can view tasks they created or are assigned to)
CREATE POLICY "Users can view their own tasks or tasks assigned to them"
    ON tasks FOR SELECT
    USING (
        auth.uid() = created_by 
        OR auth.uid() = assigned_to_user
    );

-- Policy for inserting tasks
CREATE POLICY "Users can create tasks"
    ON tasks FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Policy for updating tasks
CREATE POLICY "Users can update tasks they created or are assigned to"
    ON tasks FOR UPDATE
    USING (
        auth.uid() = created_by 
        OR auth.uid() = assigned_to_user
    );

-- Policy for deleting tasks
CREATE POLICY "Users can delete tasks they created"
    ON tasks FOR DELETE
    USING (auth.uid() = created_by);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at_trigger
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_tasks_updated_at();
