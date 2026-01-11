-- Add shortlist_id to quotations table to track which shortlist was used
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS shortlist_id UUID REFERENCES shortlists(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_quotations_shortlist ON quotations(shortlist_id);

