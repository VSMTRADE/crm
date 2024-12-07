-- Add source column to contacts table
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS source TEXT CHECK (source IN ('website', 'referral', 'social_media', 'email', 'phone', 'other'));

-- Create index for source column
CREATE INDEX IF NOT EXISTS idx_contacts_source ON contacts(source);

-- Update existing contacts with a default source
UPDATE contacts 
SET source = 'other' 
WHERE source IS NULL;
