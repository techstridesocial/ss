# 📋 INVOICE NUMBER & REFERENCE GENERATION - COMPLETE EXPLANATION

## 🎯 **INVOICE NUMBER GENERATION**

### **Format: `INV-YYYY-MM-XXXX`**

The invoice number is **automatically generated** by the database using a PostgreSQL function and trigger system:

#### **1. Database Function:**
```sql
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
```

#### **2. Auto-Generation Trigger:**
```sql
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
```

### **📊 INVOICE NUMBER EXAMPLES:**

| Date Created | Invoice Number | Explanation |
|-------------|----------------|-------------|
| January 2024 | `INV-2024-01-0001` | First invoice of January 2024 |
| January 2024 | `INV-2024-01-0002` | Second invoice of January 2024 |
| February 2024 | `INV-2024-02-0001` | First invoice of February 2024 |
| December 2024 | `INV-2024-12-0045` | 45th invoice of December 2024 |

### **🔧 HOW IT WORKS:**

1. **Automatic Generation** - When a new invoice is created, the trigger fires
2. **Year/Month Extraction** - Gets current year and month (e.g., 2024-01)
3. **Sequence Lookup** - Finds the highest sequence number for this month
4. **Increment** - Adds 1 to the highest sequence number
5. **Format** - Pads sequence with leading zeros (0001, 0002, etc.)
6. **Combine** - Creates final format: `INV-2024-01-0001`

---

## 🎯 **CAMPAIGN REFERENCE GENERATION**

### **Current Implementation:**

The **campaign reference** is **NOT automatically generated**. Instead, it uses the **Campaign ID** (UUID) as the reference:

#### **1. Campaign Creation:**
- Campaigns are created with a **UUID** as the primary key
- No custom reference number is generated
- Campaign ID format: `550e8400-e29b-41d4-a716-446655440000`

#### **2. Invoice Submission:**
```typescript
// In InvoiceSubmissionModal.tsx
const [formData, setFormData] = useState({
  campaign_reference: '', // This gets populated with campaign ID
  // ... other fields
})

// When campaign is selected:
const handleCampaignSelect = (campaignId: string) => {
  setSelectedCampaign(campaignId)
  const campaign = campaigns.find(c => c.id === campaignId)
  if (campaign) {
    setFormData(prev => ({
      ...prev,
      campaign_reference: campaignId, // Uses UUID as reference
      brand_name: campaign.brand_name
    }))
  }
}
```

#### **3. Database Storage:**
```sql
-- The campaign_reference field stores the UUID
campaign_reference VARCHAR(100) NOT NULL, -- Stores: 550e8400-e29b-41d4-a716-446655440000
```

---

## 🚀 **RECOMMENDED IMPROVEMENTS**

### **1. Human-Readable Campaign References:**

Instead of using UUIDs, we should generate human-readable campaign references:

#### **Proposed Format: `CAMP-YYYY-MM-XXXX`**

```sql
-- Function to generate campaign reference
CREATE OR REPLACE FUNCTION generate_campaign_reference()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    month_part TEXT;
    sequence_part TEXT;
    campaign_ref TEXT;
BEGIN
    -- Format: CAMP-YYYY-MM-XXXX
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    month_part := LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0');
    
    -- Get next sequence number for this month
    SELECT COALESCE(MAX(CAST(SUBSTRING(campaign_reference FROM 10) AS INTEGER)), 0) + 1
    INTO sequence_part
    FROM campaigns
    WHERE campaign_reference LIKE 'CAMP-' || year_part || '-' || month_part || '-%';
    
    -- Format sequence part with leading zeros
    sequence_part := LPAD(sequence_part, 4, '0');
    
    -- Combine all parts
    campaign_ref := 'CAMP-' || year_part || '-' || month_part || '-' || sequence_part;
    
    RETURN campaign_ref;
END;
$$ LANGUAGE plpgsql;
```

#### **Campaign Reference Examples:**
| Date Created | Campaign Reference | Explanation |
|-------------|-------------------|-------------|
| January 2024 | `CAMP-2024-01-0001` | First campaign of January 2024 |
| January 2024 | `CAMP-2024-01-0002` | Second campaign of January 2024 |
| February 2024 | `CAMP-2024-02-0001` | First campaign of February 2024 |

### **2. Enhanced Invoice References:**

We could also add campaign reference to invoice numbers:

#### **Proposed Format: `INV-YYYY-MM-XXXX-CAMP-YYYY-MM-XXXX`**

```sql
-- Enhanced invoice number with campaign reference
CREATE OR REPLACE FUNCTION generate_enhanced_invoice_number(campaign_ref TEXT)
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    month_part TEXT;
    sequence_part TEXT;
    invoice_number TEXT;
BEGIN
    -- Format: INV-YYYY-MM-XXXX-CAMP-YYYY-MM-XXXX
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    month_part := LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0');
    
    -- Get next sequence number for this month
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 12) AS INTEGER)), 0) + 1
    INTO sequence_part
    FROM influencer_invoices
    WHERE invoice_number LIKE 'INV-' || year_part || '-' || month_part || '-%';
    
    -- Format sequence part with leading zeros
    sequence_part := LPAD(sequence_part, 4, '0');
    
    -- Combine with campaign reference
    invoice_number := 'INV-' || year_part || '-' || month_part || '-' || sequence_part || '-' || campaign_ref;
    
    RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;
```

---

## 📋 **CURRENT SYSTEM SUMMARY**

### **✅ WHAT WORKS:**
- **Invoice Numbers** - Automatically generated with format `INV-YYYY-MM-XXXX`
- **Sequential Numbering** - Resets each month, prevents duplicates
- **Database Triggers** - Automatic generation on invoice creation
- **Unique Constraints** - Prevents duplicate invoice numbers

### **❌ WHAT NEEDS IMPROVEMENT:**
- **Campaign References** - Currently using UUIDs (not user-friendly)
- **No Campaign Reference Generation** - Manual entry required
- **No Link Between Invoice & Campaign** - Hard to trace relationships
- **No Human-Readable References** - Difficult for staff to reference

### **🎯 RECOMMENDED NEXT STEPS:**

1. **Add Campaign Reference Generation** - Create human-readable campaign references
2. **Update Campaign Creation** - Auto-generate references when campaigns are created
3. **Enhance Invoice Numbers** - Include campaign reference in invoice numbers
4. **Update UI** - Show human-readable references in forms and displays
5. **Add Validation** - Ensure references are unique and properly formatted

---

## 🔧 **IMPLEMENTATION PRIORITY**

### **HIGH PRIORITY:**
1. **Campaign Reference Generation** - Most important for user experience
2. **UI Updates** - Show readable references in forms
3. **Database Migration** - Add reference generation to existing campaigns

### **MEDIUM PRIORITY:**
1. **Enhanced Invoice Numbers** - Include campaign reference
2. **Validation Rules** - Ensure reference uniqueness
3. **Export Features** - Include references in reports

### **LOW PRIORITY:**
1. **Advanced Formatting** - Custom reference formats
2. **Bulk Operations** - Generate references for multiple campaigns
3. **Analytics** - Track reference usage patterns

---

## 🎉 **CURRENT STATUS**

**✅ WORKING:**
- Invoice numbers are automatically generated
- Sequential numbering works correctly
- Database triggers function properly
- No duplicate invoice numbers

**🔄 NEEDS IMPROVEMENT:**
- Campaign references use UUIDs (not user-friendly)
- No automatic campaign reference generation
- Manual entry required for campaign references
- No visual connection between invoices and campaigns

**The invoice number generation is production-ready, but campaign reference generation needs enhancement for better user experience!** 🚀
