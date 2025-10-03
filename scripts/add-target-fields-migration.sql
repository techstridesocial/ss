-- Add target_niches and target_platforms to campaigns table
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS target_niches JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS target_platforms JSONB DEFAULT '[]'::jsonb;

-- Add target_niches and target_platforms to quotations table
ALTER TABLE quotations
ADD COLUMN IF NOT EXISTS target_niches JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS target_platforms JSONB DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN campaigns.target_niches IS 'Array of target niches for the campaign (e.g., Fashion, Beauty, Gaming)';
COMMENT ON COLUMN campaigns.target_platforms IS 'Array of target platforms for the campaign (e.g., Instagram, TikTok, YouTube)';
COMMENT ON COLUMN quotations.target_niches IS 'Array of target niches requested in the quotation';
COMMENT ON COLUMN quotations.target_platforms IS 'Array of target platforms requested in the quotation';

