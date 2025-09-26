-- Enhanced Invoice System Database Schema
-- This adds comprehensive invoice management to the existing payment system

-- Invoice status enum
CREATE TYPE invoice_status AS ENUM (
    'DRAFT',
    'SENT', 
    'VERIFIED',
    'DELAYED',
    'PAID',
    'VOIDED'
);

-- Enhanced invoice table with all requirements
CREATE TABLE influencer_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    
    -- Invoice details
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    
    -- Creator details (from your requirements)
    creator_name VARCHAR(255) NOT NULL,
    creator_address TEXT,
    creator_email VARCHAR(255),
    creator_phone VARCHAR(50),
    
    -- Campaign details (from your requirements)
    campaign_reference VARCHAR(100) NOT NULL,
    brand_name VARCHAR(255) NOT NULL,
    content_description TEXT NOT NULL,
    content_link TEXT NOT NULL,
    
    -- Financial details (from your requirements)
    agreed_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    vat_required BOOLEAN DEFAULT FALSE,
    vat_rate DECIMAL(5,2) DEFAULT 20.00,
    vat_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Status and workflow
    status invoice_status DEFAULT 'DRAFT',
    staff_notes TEXT,
    payment_terms VARCHAR(50) DEFAULT 'Net 30',
    
    -- File management
    pdf_path VARCHAR(500),
    pdf_generated_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit trail
    created_by UUID REFERENCES users(id),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice line items for detailed breakdown
CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES influencer_invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice status history for audit trail
CREATE TABLE invoice_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES influencer_invoices(id) ON DELETE CASCADE,
    old_status invoice_status,
    new_status invoice_status NOT NULL,
    changed_by UUID REFERENCES users(id),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_influencer_invoices_influencer_id ON influencer_invoices(influencer_id);
CREATE INDEX idx_influencer_invoices_campaign_id ON influencer_invoices(campaign_id);
CREATE INDEX idx_influencer_invoices_status ON influencer_invoices(status);
CREATE INDEX idx_influencer_invoices_created_at ON influencer_invoices(created_at);

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    month_part TEXT;
    sequence_part TEXT;
    invoice_number TEXT;
BEGIN
    -- Format: INV-YYYY-MM-XXXX
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    month_part := LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0');
    
    -- Get next sequence number for this month
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 12) AS INTEGER)), 0) + 1
    INTO sequence_part
    FROM influencer_invoices
    WHERE invoice_number LIKE 'INV-' || year_part || '-' || month_part || '-%';
    
    -- Format sequence part with leading zeros
    sequence_part := LPAD(sequence_part, 4, '0');
    
    -- Combine all parts
    invoice_number := 'INV-' || year_part || '-' || month_part || '-' || sequence_part;
    
    RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate invoice number
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        NEW.invoice_number := generate_invoice_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invoice_number
    BEFORE INSERT ON influencer_invoices
    FOR EACH ROW
    EXECUTE FUNCTION set_invoice_number();

-- Trigger to update status history
CREATE OR REPLACE FUNCTION log_invoice_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO invoice_status_history (
            invoice_id,
            old_status,
            new_status,
            changed_by,
            reason
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            NEW.verified_by,
            'Status updated'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_status_change
    AFTER UPDATE ON influencer_invoices
    FOR EACH ROW
    EXECUTE FUNCTION log_invoice_status_change();

-- Function to calculate VAT and total
CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate VAT amount if required
    IF NEW.vat_required THEN
        NEW.vat_amount := NEW.agreed_price * (NEW.vat_rate / 100);
    ELSE
        NEW.vat_amount := 0;
    END IF;
    
    -- Calculate total amount
    NEW.total_amount := NEW.agreed_price + NEW.vat_amount;
    
    -- Set due date if not provided (default to 30 days)
    IF NEW.due_date IS NULL THEN
        NEW.due_date := NEW.invoice_date + INTERVAL '30 days';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_totals
    BEFORE INSERT OR UPDATE ON influencer_invoices
    FOR EACH ROW
    EXECUTE FUNCTION calculate_invoice_totals();
